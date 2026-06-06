export class Animator {
  static easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  static easeInCubic(t: number): number {
    return t * t * t;
  }

  static easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  static easeOutSine(t: number): number {
    return Math.sin((t * Math.PI) / 2);
  }

  static easeInSine(t: number): number {
    return 1 - Math.cos((t * Math.PI) / 2);
  }

  static easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  static animate(
    duration: number,
    onUpdate: (progress: number) => void,
    onComplete?: () => void,
    easing: (t: number) => number = Animator.easeOutCubic
  ): () => void {
    const startTime = performance.now();
    let animationId: number;
    let cancelled = false;

    const animateFrame = () => {
      if (cancelled) return;

      const elapsed = performance.now() - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(rawProgress);

      onUpdate(easedProgress);

      if (rawProgress < 1) {
        animationId = requestAnimationFrame(animateFrame);
      } else {
        onComplete?.();
      }
    };

    animationId = requestAnimationFrame(animateFrame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationId);
    };
  }

  static tween(
    target: any,
    props: Record<string, number>,
    duration: number,
    easing?: (t: number) => number
  ): () => void {
    const startValues: Record<string, number> = {};
    const endValues = { ...props };

    Object.keys(endValues).forEach(key => {
      startValues[key] = target[key] ?? 0;
    });

    return Animator.animate(
      duration,
      (progress) => {
        Object.keys(endValues).forEach(key => {
          target[key] = startValues[key] + (endValues[key] - startValues[key]) * progress;
        });
      },
      undefined,
      easing
    );
  }

  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
