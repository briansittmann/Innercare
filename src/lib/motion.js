/** Base gap between beats of a staggered entrance, in ms. */
export const STEP = 120

/** Delay for the nth beat of a sequence. */
export const step = (n) => n * STEP
