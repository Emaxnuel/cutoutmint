import '../styles/globals.css'
import styles from '../styles/Home.module.css'
import Link from 'next/link'

function Marketplace({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className="titulo text-7xl pb-3">CUTOUT DASHBOARD</p>
        <div className="flex justify-around mt-4">
          <Link href="/">
            <a className="textoCutout text-xl">
              Pujas
            </a>
          </Link>
          <Link href="/create-item">
            <a className="textoCutout text-xl">
              Mint
            </a>
          </Link>
          <Link href="/my-assets">
            <a className="textoCutout text-xl">
              Mis NFT
            </a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="textoCutout text-xl">
              Creator Dashboard
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default Marketplace