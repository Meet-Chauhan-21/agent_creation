const Run = require('../models/Run');
const Secret = require('../models/Secret');

// Node executors
const nodeExecutors = {
  'http-request': async (node, input, context) => {
    const { method, url, headers, body, timeout } = node.data;
    
    try {
      const response = await fetch(url, {
        method: method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: method !== 'GET' ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(timeout || 30000),
      });

      const data = await response.json();
      return {
        success: true,
        data: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: data,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  'json-parse': async (node, input, context) => {
    const { jsonString } = node.data;
    
    try {
      const parsed = JSON.parse(jsonString || input.data);
      return {
        success: true,
        data: parsed,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid JSON: ' + error.message,
      };
    }
  },

  'log': async (node, input, context) => {
    const { message, level } = node.data;
    const logMessage = message || JSON.stringify(input);
    
    context.addLog(level || 'info', logMessage, node.id);
    
    return {
      success: true,
      data: { logged: true, message: logMessage },
    };
  },

  'delay': async (node, input, context) => {
    const { duration } = node.data;
    const delayMs = duration || 1000;
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    return {
      success: true,
      data: { delayed: delayMs },
    };
  },

  'condition': async (node, input, context) => {
    const { value1, operator, value2 } = node.data;
    
    let result = false;
    const v1 = value1 || input.data;
    const v2 = value2;
    
    switch (operator) {
      case '==':
        result = v1 == v2;
        break;
      case '!=':
        result = v1 != v2;
        break;
      case '>':
        result = v1 > v2;
        break;
      case '<':
        result = v1 < v2;
        break;
      case '>=':
        result = v1 >= v2;
        break;
      case '<=':
        result = v1 <= v2;
        break;
    }
    
    return {
      success: true,
      data: { result, output: result ? 'true' : 'false' },
      output: result ? 'true' : 'false',
    };
  },

  'transform': async (node, input, context) => {
    const { code } = node.data;
    
    try {
      // Create a safe function context
      const fn = new Function('data', 'input', 'context', code);
      const result = fn(input.data, input, context);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Transform error: ' + error.message,
      };
    }
  },

  'webhook': async (node, input, context) => {
    // Webhook is a trigger, so just pass through
    return {
      success: true,
      data: input.data || { triggered: true },
    };
  },

  'schedule': async (node, input, context) => {
    // Schedule is a trigger, just pass through
    return {
      success: true,
      data: { triggered: true, timestamp: new Date() },
    };
  },

  'email': async (node, input, context) => {
    const { to, subject, body, secretId } = node.data;
    
    // Simulate email sending
    context.addLog('info', `Email sent to ${to}: ${subject}`, node.id);
    
    return {
      success: true,
      data: { sent: true, to, subject },
    };
  },

  'database-query': async (node, input, context) => {
    const { query, secretId } = node.data;
    
    // Simulate database query
    context.addLog('info', `Executing query: ${query}`, node.id);
    
    return {
      success: true,
      data: { results: [], rowCount: 0 },
    };
  },
};

// Build execution graph
function buildExecutionGraph(workflow) {
  const { nodes, edges } = workflow;
  const graph = new Map();
  
  // Initialize nodes
  nodes.forEach(node => {
    graph.set(node.id, {
      node,
      incoming: [],
      outgoing: [],
    });
  });
  
  // Add edges
  edges.forEach(edge => {
    const sourceNode = graph.get(edge.source);
    const targetNode = graph.get(edge.target);
    
    if (sourceNode && targetNode) {
      sourceNode.outgoing.push({
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      });
      targetNode.incoming.push({
        source: edge.source,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      });
    }
  });
  
  return graph;
}

// Find starting nodes (nodes with no incoming edges)
function findStartNodes(graph) {
  const startNodes = [];
  
  graph.forEach((value, nodeId) => {
    if (value.incoming.length === 0) {
      startNodes.push(nodeId);
    }
  });
  
  return startNodes;
}

// Execute workflow
async function executeWorkflow(workflow, run, io) {
  const startTime = Date.now();
  
  try {
    // Update run status
    run.status = 'running';
    run.startedAt = new Date();
    await run.save();
    
    // Emit status via socket
    if (io) {
      io.emit(`run:${run._id}`, {
        status: 'running',
        runId: run._id,
      });
    }
    
    // Create execution context
    const context = {
      workflow,
      run,
      io,
      logs: [],
      nodeOutputs: new Map(),
      addLog: (level, message, nodeId, data) => {
        const log = {
          level,
          message,
          nodeId,
          timestamp: new Date(),
          data,
        };
        context.logs.push(log);
        run.logs.push(log);
        
        if (io) {
          io.emit(`run:${run._id}:log`, log);
        }
      },
    };
    
    context.addLog('info', 'Workflow execution started');
    
    // Build execution graph
    const graph = buildExecutionGraph(workflow);
    const startNodes = findStartNodes(graph);
    
    if (startNodes.length === 0) {
      throw new Error('No starting nodes found in workflow');
    }
    
    context.addLog('info', `Found ${startNodes.length} starting node(s)`);
    
    // Execute nodes
    const executed = new Set();
    const queue = [...startNodes];
    
    while (queue.length > 0) {
      const nodeId = queue.shift();
      
      if (executed.has(nodeId)) {
        continue;
      }
      
      const graphNode = graph.get(nodeId);
      const node = graphNode.node;
      
      context.addLog('info', `Executing node: ${node.type} (${node.id})`);
      
      const nodeExecution = {
        nodeId: node.id,
        status: 'running',
        startedAt: new Date(),
      };
      
      try {
        // Get input from previous nodes
        let input = { data: run.input };
        
        if (graphNode.incoming.length > 0) {
          const sourceNodeId = graphNode.incoming[0].source;
          const sourceOutput = context.nodeOutputs.get(sourceNodeId);
          if (sourceOutput) {
            input = { data: sourceOutput.data };
          }
        }
        
        nodeExecution.input = input;
        
        // Execute node
        const executor = nodeExecutors[node.type];
        if (!executor) {
          throw new Error(`No executor found for node type: ${node.type}`);
        }
        
        const result = await executor(node, input, context);
        
        if (result.success) {
          nodeExecution.status = 'success';
          nodeExecution.output = result.data;
          context.nodeOutputs.set(node.id, result);
          
          context.addLog('info', `Node completed: ${node.type} (${node.id})`);
          
          // Add outgoing nodes to queue
          graphNode.outgoing.forEach(edge => {
            // Check if output matches (for conditional nodes)
            if (!result.output || result.output === edge.sourceHandle || !edge.sourceHandle) {
              queue.push(edge.target);
            }
          });
        } else {
          nodeExecution.status = 'failed';
          nodeExecution.error = result.error;
          throw new Error(result.error);
        }
      } catch (error) {
        nodeExecution.status = 'failed';
        nodeExecution.error = error.message;
        nodeExecution.finishedAt = new Date();
        run.nodeExecutions.push(nodeExecution);
        
        throw error;
      }
      
      nodeExecution.finishedAt = new Date();
      run.nodeExecutions.push(nodeExecution);
      executed.add(nodeId);
    }
    
    // Success
    const lastNodeOutput = Array.from(context.nodeOutputs.values()).pop();
    run.output = lastNodeOutput ? lastNodeOutput.data : {};
    run.status = 'success';
    context.addLog('info', 'Workflow execution completed successfully');
    
  } catch (error) {
    run.status = 'failed';
    run.error = {
      message: error.message,
      stack: error.stack,
    };
    
    if (io) {
      io.emit(`run:${run._id}:error`, {
        error: error.message,
      });
    }
  } finally {
    run.finishedAt = new Date();
    run.duration = Date.now() - startTime;
    await run.save();
    
    if (io) {
      io.emit(`run:${run._id}`, {
        status: run.status,
        runId: run._id,
        duration: run.duration,
      });
    }
  }
}

module.exports = {
  executeWorkflow,
  nodeExecutors,
};
