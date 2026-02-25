/**
 * Backward-compatibility re-export.
 *
 * The canonical implementation is now in services/tools/rest-api.executor.ts.
 * This file exists so any code that imports from 'tool-executor.js' continues
 * to work without changes.
 */
export { restApiExecutor as executeRestTool } from './tools/rest-api.executor.js';
export type { ToolResult as ToolExecutionResult } from './tools/types.js';
