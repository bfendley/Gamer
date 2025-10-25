export class Hud {
  private bonesElement = document.getElementById('bones-count');
  private timeElement = document.getElementById('time-elapsed');
  private moodElement = document.getElementById('mood-status');

  updateBones(count: number) {
    if (this.bonesElement) {
      this.bonesElement.textContent = count.toString();
    }
  }

  updateTime(seconds: number) {
    if (this.timeElement) {
      this.timeElement.textContent = `${seconds.toFixed(1)}s`;
    }
  }

  updateMood(mood: string) {
    if (this.moodElement) {
      this.moodElement.textContent = mood;
    }
  }
}
