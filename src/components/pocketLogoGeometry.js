// Pocket's circular mark, traced in normalized coordinates from Pocket-logo.png.
// Two openings preserve the ring and the continuous dipping center stroke.
export function createPocketLogoGeometry(THREE) {
  const radius = 1.9;
  const upperY = .16;
  const lowerY = .04;
  const upperX = Math.sqrt(radius ** 2 - upperY ** 2);
  const lowerX = Math.sqrt(radius ** 2 - lowerY ** 2);
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 2, 0, Math.PI * 2, false);

  const top = new THREE.Path();
  top.moveTo(-upperX, upperY);
  top.absarc(0, 0, radius, Math.PI - Math.asin(upperY / radius), Math.asin(upperY / radius), true);
  top.lineTo(1, upperY);
  top.bezierCurveTo(.38, upperY, .52, -.84, 0, -.84);
  top.bezierCurveTo(-.52, -.84, -.38, upperY, -1, upperY);
  top.closePath();

  const bottom = new THREE.Path();
  bottom.moveTo(lowerX, lowerY);
  bottom.absarc(0, 0, radius, Math.asin(lowerY / radius), Math.PI - Math.asin(lowerY / radius), true);
  bottom.lineTo(-1, lowerY);
  bottom.bezierCurveTo(-.48, lowerY, -.62, -.96, 0, -.96);
  bottom.bezierCurveTo(.62, -.96, .48, lowerY, 1, lowerY);
  bottom.closePath();
  shape.holes.push(top, bottom);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: .24,
    bevelEnabled: true,
    bevelThickness: .025,
    bevelSize: .022,
    bevelSegments: 4,
    curveSegments: 96,
    steps: 1,
  });
  geometry.translate(0, 0, -.12);
  return geometry;
}
