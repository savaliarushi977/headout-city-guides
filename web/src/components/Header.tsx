export default function Header() {
  return (
    <header className="site-header">
      <div className="rail site-header__inner">
        <a href="#/" className="logo" aria-label="Headout city guides, home">
          <span className="logo__word">headout</span>
          <span className="logo__sep" aria-hidden />
          <span className="t-label-regular grey-2">City guides</span>
        </a>
      </div>
    </header>
  );
}
