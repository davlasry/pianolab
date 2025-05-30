import { useCallback, useEffect } from "react";
import { useActiveTouchPoints } from "@/components/Player/Keyboard/interactivity/useTouch/useActiveTouchPoints.ts";

type UseTouchProps = {
    enabled: boolean;
    klavierRootRef: React.RefObject<HTMLDivElement>;
    pressKey: (midiNumber: number) => void;
    releaseKey: (midiNumber: number) => void;
};

function useTouch(props: UseTouchProps) {
    const { klavierRootRef, enabled, pressKey, releaseKey } = props;
    const { activeTouchPoints, upsertTouchPoint, removeTouchPoint } =
        useActiveTouchPoints();

    const handleTouchStart = useCallback(
        (event: TouchEvent) => {
            event.preventDefault();
            Array.from(event.changedTouches).forEach((addedTouch) => {
                const targetEvaluation = evaluateTarget(
                    addedTouch.clientX,
                    addedTouch.clientY,
                );
                if (!targetEvaluation.isValidTarget) return;
                upsertTouchPoint(
                    addedTouch.identifier,
                    targetEvaluation.midiNumber,
                );
                pressKey(targetEvaluation.midiNumber);
            });
        },
        [pressKey, upsertTouchPoint],
    );

    const handleTouchEnd = useCallback(
        (event: TouchEvent) => {
            Array.from(event.changedTouches).forEach((removedTouch) => {
                const targetEvaluation = evaluateTarget(
                    removedTouch.clientX,
                    removedTouch.clientY,
                );
                if (!targetEvaluation.isValidTarget) return;

                removeTouchPoint(removedTouch.identifier);
                if (
                    wasLastTouchOnKey(
                        targetEvaluation.midiNumber,
                        removedTouch.identifier,
                        event.touches,
                    )
                ) {
                    releaseKey(targetEvaluation.midiNumber);
                }
            });
        },
        [releaseKey, removeTouchPoint],
    );

    const handleTouchMove = useCallback(
        (event: TouchEvent) => {
            Array.from(event.changedTouches).forEach((movedTouch) => {
                const previousMidiNumber =
                    activeTouchPoints[movedTouch.identifier];
                const outcome = getTouchMoveOutcome(
                    movedTouch,
                    previousMidiNumber,
                );

                if (outcome.type === "SAME_KEY") {
                    return;
                }

                if (outcome.type === "NEW_KEY") {
                    upsertTouchPoint(movedTouch.identifier, outcome.midiNumber);
                    pressKey(outcome.midiNumber);
                }

                if (outcome.type === "OUTSIDE_KEY") {
                    removeTouchPoint(movedTouch.identifier);
                }

                if (
                    wasLastTouchOnKey(
                        previousMidiNumber,
                        movedTouch.identifier,
                        event.touches,
                    )
                ) {
                    releaseKey(previousMidiNumber);
                }
            });
        },
        [
            activeTouchPoints,
            upsertTouchPoint,
            removeTouchPoint,
            pressKey,
            releaseKey,
        ],
    );

    const handleTouchCancel = useCallback(
        (event: TouchEvent) => {
            Array.from(event.changedTouches).forEach((cancelledTouch) => {
                releaseKey(activeTouchPoints[cancelledTouch.identifier]);
                removeTouchPoint(cancelledTouch.identifier);
            });
        },
        [activeTouchPoints, removeTouchPoint, releaseKey],
    );

    useEffect(() => {
        const klavierRootElement = klavierRootRef.current;

        if (!klavierRootElement) {
            return;
        }

        if (!enabled) {
            return;
        }

        klavierRootElement.addEventListener("touchstart", handleTouchStart);
        klavierRootElement.addEventListener("touchmove", handleTouchMove);
        klavierRootElement.addEventListener("touchend", handleTouchEnd);
        klavierRootElement.addEventListener("touchcancel", handleTouchCancel);

        return () => {
            klavierRootElement.removeEventListener(
                "touchstart",
                handleTouchStart,
            );
            klavierRootElement.removeEventListener(
                "touchmove",
                handleTouchMove,
            );
            klavierRootElement.removeEventListener("touchend", handleTouchEnd);
            klavierRootElement.removeEventListener(
                "touchcancel",
                handleTouchCancel,
            );
        };
    }, [
        klavierRootRef,
        enabled,
        handleTouchStart,
        handleTouchEnd,
        handleTouchMove,
        handleTouchCancel,
    ]);
}

type TargetEvaluationResult =
    | {
          isValidTarget: true;
          midiNumber: number;
      }
    | {
          isValidTarget: false;
      };

function evaluateTarget(x: number, y: number): TargetEvaluationResult {
    const target = document
        .elementsFromPoint(x, y)
        .find((element) => element.hasAttribute("data-midi-number"));

    return target instanceof HTMLElement &&
        !isNaN(Number(target.dataset.midiNumber))
        ? { isValidTarget: true, midiNumber: Number(target.dataset.midiNumber) }
        : { isValidTarget: false };
}

function wasLastTouchOnKey(
    keyMidiNumber: number,
    identifier: number,
    touches: TouchList,
) {
    const remainingTouchesOnKey = Array.from(touches).filter((touch) => {
        if (touch.identifier === identifier) return false;
        const evaluation = evaluateTarget(touch.clientX, touch.clientY);

        return (
            evaluation.isValidTarget && evaluation.midiNumber === keyMidiNumber
        );
    });

    return remainingTouchesOnKey.length === 0;
}

type MoveLocationResult =
    | {
          type: "NEW_KEY";
          midiNumber: number;
      }
    | {
          type: "SAME_KEY";
      }
    | {
          type: "OUTSIDE_KEY";
      };

function getTouchMoveOutcome(
    touch: Touch,
    previousMidiNumber: number,
): MoveLocationResult {
    const targetEvaluation = evaluateTarget(touch.clientX, touch.clientY);

    if (!targetEvaluation.isValidTarget) {
        return {
            type: "OUTSIDE_KEY",
        };
    }

    if (targetEvaluation.midiNumber === previousMidiNumber) {
        return {
            type: "SAME_KEY",
        };
    }

    return {
        type: "NEW_KEY",
        midiNumber: targetEvaluation.midiNumber,
    };
}

export { useTouch };
