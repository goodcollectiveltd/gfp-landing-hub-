import { Component, type ReactNode } from "react";

// Per-section error boundary. LLM-generated section data can be malformed (a
// missing array, a wrong shape); without this, one bad block throws and React
// unmounts the WHOLE page (blank screen). This isolates the failure to its own
// block so the rest of the page still renders — the owner reviews before
// publish and can regenerate/fix the flagged block.
export default class SectionBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[SectionBoundary] a section failed to render:", error);
  }

  render() {
    if (this.state.failed) {
      return (
        <section className="px-6 py-8">
          <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-black/15 p-4 text-center">
            <p className="lp-muted text-xs">This section couldn’t be displayed — regenerate or edit it.</p>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}
