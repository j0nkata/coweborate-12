import { PROCESS_MORPH_STATES } from "./processMorphStates";
import styles from "./FlowSection.module.css";

export function ProcessMorphVisual({ stateIndex = 0, desktop = false }: { stateIndex?: number; desktop?: boolean }) {
  const state = PROCESS_MORPH_STATES[stateIndex];

  return (
    <div className={styles.visualCanvas} data-process-visual={desktop ? "desktop" : undefined} aria-hidden="true">
      <svg viewBox="0 0 480 480" focusable="false" data-process-morph-state={desktop ? undefined : state.name}>
        <path className={styles.morphSpine} data-morph-spine d={state.spine} />
        <path className={styles.morphOutline} data-morph-outline d={state.outline} />
        {desktop ? PROCESS_MORPH_STATES.map((morphState, index) => (
          <path
            className={styles.morphDetail}
            data-morph-detail={morphState.name}
            d={morphState.detail}
            key={morphState.name}
            style={{ opacity: index === 0 ? 1 : 0 }}
          />
        )) : <path className={styles.morphDetail} d={state.detail} />}
        <rect className={styles.morphAccent} data-morph-accent width="20" height="20" x={state.accent.x} y={state.accent.y} />
      </svg>
    </div>
  );
}
