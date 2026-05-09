import { VFLFlush, type FlushData } from "../Flush.ts";

/**
 * A flush that generates a Mermaid.js diagram string for the trace graph.
 */
export class MermaidFlush extends VFLFlush {
  async flush(data: FlushData): Promise<void> {
    console.log("--- MERMAID FLUSH START ---");

    for (const trace of data.traces) {
      const traceBlocks = data.blocks.filter(b => b.traceId === trace.id);
      const traceEdges = data.edges.filter(e => e.traceId === trace.id);

      let mermaid = `flowchart TD\n`;
      mermaid += `  %% Trace: ${trace.name}\n`;

      // Define blocks
      for (const block of traceBlocks) {
        const label = `${block.scope}: ${block.blockType}`;
        mermaid += `  ${block.id.replace(/-/g, '_')}["${label}"]\n`;
      }

      // Define edges
      for (const edge of traceEdges) {
        const fromId = edge.fromBlockId.replace(/-/g, '_');
        const toId = edge.toBlockId.replace(/-/g, '_');
        mermaid += `  ${fromId} -- ${edge.edgeType} --> ${toId}\n`;
      }

      console.log(`\nTrace: ${trace.name}\n`);
      console.log(mermaid);
    }

    console.log("--- MERMAID FLUSH END ---");
  }
}
