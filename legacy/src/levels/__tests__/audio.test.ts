import { describe, it, expect } from 'vitest';
import { audio } from '../../audio';

describe('audio bus', () => {
  it('is a safe no-op without WebAudio', () => {
    for (const n of ['shotgun', 'stun', 'purge', 'door', 'pickup', 'alert_hound', 'fireball', 'hurt', 'radio', 'step', 'drone', 'fire', 'unknown'])
      expect(() => audio.play(n, { x: 3, y: 2 }, { pos: { x: 0, y: 0 }, angle: 0 })).not.toThrow();
    expect(() => audio.play('door')).not.toThrow();
  });
});
