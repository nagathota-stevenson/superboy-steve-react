export default function HexBadge({ size = '', children, className = '' }) {
  const sizeClass = size ? `hex-${size}` : '';
  return (
    <div className={`hex ${sizeClass} ${className}`}>
      <div className="hex-inner">{children}</div>
    </div>
  );
}
