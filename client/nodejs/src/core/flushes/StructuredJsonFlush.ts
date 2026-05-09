import { VFLFlush, type FlushData } from "../Flush.ts";
import { VFLVisualizer } from "../Visualizer.ts";

/**
 * A flush that transforms the flat state into hierarchical JSON for each trace.
 */
export class StructuredJsonFlush extends VFLFlush {
  async flush(data: FlushData): Promise<void> {
    console.log("--- STRUCTURED JSON FLUSH START ---");
    
    for (const trace of data.traces) {
      const traceBlocks = data.blocks.filter(b => b.traceId === trace.id);
      const traceEdges = data.edges.filter(e => e.traceId === trace.id);
      
      const structured = VFLVisualizer.structure(trace, traceBlocks, traceEdges);
      console.log(`Trace: ${trace.name} (${trace.id})`);
      console.log(JSON.stringify(structured, null, 2));
    }
    
    console.log("--- STRUCTURED JSON FLUSH END ---");
  }
}
