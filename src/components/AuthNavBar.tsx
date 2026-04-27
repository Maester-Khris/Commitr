import logo from '../assets/images/logo.png'
import brand from '../assets/images/brand.png'

export default function AuthNavBar() {
  return (
    <div className="border-b border-gray-800">
      <nav className="flex items-center px-4 md:px-14 py-4">
        <img
          src={brand}
          alt="Commitr"
          className="hidden md:block h-[85px] w-auto object-contain"
        />
        <div className="flex md:hidden items-center gap-2">
          <img src={logo} alt="Commitr Logo" className="h-8 w-auto object-contain" />
          <span className="text-xl font-bold tracking-tight text-white">Commitr</span>
        </div>
      </nav>
    </div>
  )
}
