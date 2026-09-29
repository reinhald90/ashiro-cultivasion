export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">
        <img src="/logo.png" alt="Ashiro" />
        <span>Ashiro Cultivation</span>
      </div>
      <div className="loading-bar"><div className="loading-bar-fill" /></div>
      <p className="loading-text">Memuat dunia kultivasi...</p>
    </div>
  );
}
