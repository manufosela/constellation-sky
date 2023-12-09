import { html, css, LitElement } from 'lit';
import { constellationData } from './constellationData.js';

export class ConstellationSky extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 0;
      margin: 0;
    }
    
    .constellation-container {
      position: relative;
      width: 500px;
      height: 500px;
      background-color: black;
    }
    
    .star {
      position: absolute;
      width: 5px;
      height: 5px;
      background-color: white;
      border-radius: 50%;
    }
    
    .line {
      position: absolute;
      height: 1px;
      background-color: white;
    }
  `;

  static properties = {
    drawLines: { type: Boolean, attribute: 'draw-lines' },
    hexStarColor: { type: String, attribute: 'hex-starcolor' },
    degRotate: { type: Number, attribute: 'deg-rotate' },
    constellationName: { type: String, attribute: 'constellation-name' },
    constellationScale: { type: Number, attribute: 'constellation-scale' },
    maxStarSize: { type: Number, attribute: 'max-star-size' },
    minStarSize: { type: Number, attribute: 'min-star-size' },
  };

  constructor() {
    super();
    this.constellationScale = 1;
    this.constellationWidth = 500;
    this.constellationHeight = 1000;
    this.constellationName = 'orion';
    this.drawLines = false;
    this.hexStarColor = '#ffffff';
    this.degRotate = 0;
    this.minStarSize = 2;
    this.maxStarSize = 10;
  }

  firstUpdated() {
    const canvas = this.shadowRoot.getElementById('constellationCanvas');
    canvas.style.transform = `rotate(${this.degRotate}deg)`;
    this.drawConstellation();
  }

  updated(changedProperties) {
    if (changedProperties.has('degRotate')) {
      const canvas = this.shadowRoot.getElementById('constellationCanvas');
      canvas.style.transform = `rotate(${this.degRotate}deg)`;
    }
    if (changedProperties.has('drawLines')) {
      this.drawConstellation();
    }
    if (changedProperties.has('starColor')) {
      this.drawConstellation();
    }
  }

  static hexToRgb(_hex) {
    const hex = _hex.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
  }

  calculateStarSizeByMagnitude(magnitude) {
    const maxSize = this.maxStarSize;
    const minSize = this.minStarSize;
    const size = maxSize - (magnitude / 5) * (maxSize - minSize);
    return Math.max(minSize, Math.min(size, maxSize));
  }

  colorIntensityByMagnitude(magnitude) {
    const starColor = ConstellationSky.hexToRgb(this.hexStarColor);
    const maxMagnitude = 6; // maxima magnitud visible
    let alpha = 1 - (magnitude / maxMagnitude);
    alpha = Math.max(0, Math.min(alpha, 1));
    return `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, ${alpha.toFixed(2)})`;
  }


  drawConstellationStars(ctx, constellation) {
    const scale = this.constellationScale;
    constellation.stars.forEach(star => {
      const size = this.calculateStarSizeByMagnitude(star.magnitude);
      const starColor = this.colorIntensityByMagnitude(star.magnitude);
      ctx.beginPath();
      ctx.arc(star.x * scale, star.y * scale, size, 0, 2 * Math.PI);
      ctx.fillStyle = starColor;
      ctx.fill();
    });
  }

  drawConstellationLines(ctx, constellation) {
    const scale = this.constellationScale;
    if (!this.drawLines) {
      return;
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    constellation.lines.forEach(line => {
      const startStar = constellation.stars.find(star => star.id === line.from);
      const endStar = constellation.stars.find(star => star.id === line.to);

      ctx.beginPath();
      ctx.moveTo(startStar.x * scale, startStar.y * scale);
      ctx.lineTo(endStar.x * scale, endStar.y * scale);
      ctx.stroke();
    });
  }

  drawConstellation() {
    const constellation = constellationData[this.constellationName];
    const canvas = this.shadowRoot.getElementById('constellationCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = constellation.width * this.constellationScale;
    canvas.height = constellation.height * this.constellationScale;

    this.drawConstellationStars(ctx, constellation);
    this.drawConstellationLines(ctx, constellation);
  }

  render() {
    return html`
      <canvas id="constellationCanvas" width="${this.constellationWidth}" height="${this.constellationHeight}"></canvas>
    `;
  }
}
