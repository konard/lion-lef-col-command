import { ReactiveController, ReactiveControllerHost } from "lit";

export interface DragDropState {
  isDragging: boolean;
  draggedId: string | null;
  overId: string | null;
  position: "above" | "below" | null;
}

export class DragDropController implements ReactiveController {
  host: ReactiveControllerHost;
  state: DragDropState = {
    isDragging: false,
    draggedId: null,
    overId: null,
    position: null,
  };

  private onReorder: ((fromId: string, toId: string, position: "above" | "below") => void) | null =
    null;

  constructor(
    host: ReactiveControllerHost,
    onReorder: (fromId: string, toId: string, position: "above" | "below") => void,
  ) {
    this.host = host;
    this.onReorder = onReorder;
    host.addController(this);
  }

  hostConnected(): void {}
  hostDisconnected(): void {
    this.reset();
  }

  handleDragStart(blockId: string): void {
    this.state = {
      isDragging: true,
      draggedId: blockId,
      overId: null,
      position: null,
    };
    this.host.requestUpdate();
  }

  handleDragOver(blockId: string, event: DragEvent): void {
    if (!this.state.isDragging || blockId === this.state.draggedId) return;
    event.preventDefault();

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position: "above" | "below" = event.clientY < midY ? "above" : "below";

    if (this.state.overId !== blockId || this.state.position !== position) {
      this.state = { ...this.state, overId: blockId, position };
      this.host.requestUpdate();
    }
  }

  handleDrop(): void {
    if (
      this.state.draggedId &&
      this.state.overId &&
      this.state.position &&
      this.state.draggedId !== this.state.overId
    ) {
      this.onReorder?.(this.state.draggedId, this.state.overId, this.state.position);
    }
    this.reset();
  }

  handleDragEnd(): void {
    this.reset();
  }

  private reset(): void {
    this.state = {
      isDragging: false,
      draggedId: null,
      overId: null,
      position: null,
    };
    this.host.requestUpdate();
  }
}
