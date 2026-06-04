import { Link } from "react-router"
import { FaMapMarkerAlt, FaUsers, FaAppleAlt, FaBriefcase, FaQuoteLeft, FaHeart, FaBars, FaTimes, FaCalendarAlt, FaClipboardList, FaBell } from "react-icons/fa"
import { Mail, Phone, MapPin } from "lucide-react";
{/*import { DogFact } from "../components/dashboard/DogFact.jsx";*/ }
import { useState } from "react";

export const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      {/* HEADER */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo + Nombre */}
            <Link 
              to="/" 
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-2"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/128/5975/5975441.png"
                alt="logo"
                className="w-9 h-9"
              />
              <span className="font-bold text-xl bg-clip-text">
                PetConnect
              </span>
            </Link>

            {/* Navegación - DESKTOP*/}
            <div className="hidden md:flex items-center gap-10">
              <a href="#funcionalidades" className="text-secondary/80 hover:text-primary transition-colors duration-300 font-medium">
                Funcionalidades
              </a>
              <a href="#nosotros" className="text-secondary/80 hover:text-primary transition-colors duration-300 font-medium">
                Sobre Nosotros
              </a>
              <a href="#contacto" className="text-secondary/80 hover:text-primary transition-colors duration-300 font-medium">
                Contacto
              </a>
            </div>

            {/* Botones */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="text-secondary bg-secondary/5 px-5 py-2 rounded-lg hover:bg-secondary/10 transition-all duration-300 transform-gpu font-medium"
              >
                Iniciar Sesión
              </Link>

              <Link
                to="/register"
                className="text-white bg-primary hover:bg-primary-hover px-6 py-2 rounded-lg transition-all duration-300 transform-gpu font-medium"
              >
                Registrarse
              </Link>
            </div>

            <div className="md:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden bg-white shadow-lg">
              <div className="flex flex-col gap-4 p-4 text-center">
                <a href="#funcionalidades" onClick={() => setMenuOpen(false)} className="text-secondary/80 hover:text-primary transition-colors duration-300 transform-gpu font-medium block py-1">Funcionalidades</a>
                <a href="#nosotros" onClick={() => setMenuOpen(false)} className="text-secondary/80 hover:text-primary transition-colors duration-300 transform-gpu font-medium block py-1">Sobre Nosotros</a>
                <a href="#contacto" onClick={() => setMenuOpen(false)} className="text-secondary/80 hover:text-primary transition-colors duration-300 transform-gpu font-medium block py-1">Contacto</a>
                <div className="flex flex-col gap-2 mt-2">
                  <Link to="/login" className="text-secondary bg-secondary/5 px-4 py-2 rounded-lg font-medium hover:bg-secondary/10 transition-all duration-300 transform-gpu text-center">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded-lg font-medium transition-all duration-300 transform-gpu text-center">
                    Registrarse
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section
        className="flex flex-col justify-end min-h-[calc(100vh-4rem)] py-16 bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=1200')",
        }}
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Conectando a las mascotas y dueños de Torres El Pedregal.
            </h2>
            <p className="text-lg text-base/90">
              Administra los perfiles de tus mascotas, gestiona sus compromisos sanitarios con notificaciones automáticas y conecta con cuidadores calificados en tu comunidad.
            </p>
          </div>

          <div className="flex gap-4 mt-6 flex-wrap">
            <Link
              to="/register"
              className="text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-80 transition-all duration-300 transform-gpu bg-accent"
            >
              Registrarse Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="px-6 py-20 bg-base">
        <h2 className="text-3xl font-extrabold text-center mb-10 text-secondary">
          Funcionalidades diseñadas para ti y tu mascota
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<FaHeart />}
            title="Perfiles de Mascotas"
            text="Registra a tus mejores amigos con su foto, raza, peso y detalles esenciales."
            gradientClasses="bg-gradient-to-br from-primary-light to-primary-lighter"
          />
          <FeatureCard
            icon={<FaCalendarAlt />}
            title="Compromisos Sanitarios"
            text="Organiza calendarios de vacunas y desparasitación con notificaciones automáticas."
            gradientClasses="bg-gradient-to-br from-primary-light to-primary-lighter"
          />
          <FeatureCard
            icon={<FaClipboardList />}
            title="Solicitud de Servicios"
            text="Publica anuncios detallando tus necesidades y recibe postulaciones de tus vecinos."
            gradientClasses="bg-gradient-to-br from-primary-light to-primary-lighter"
          />
          <FeatureCard
            icon={<FaBriefcase />}
            title="Cuidado y Paseo Local"
            text="Regístrate como cuidador, fija tus tarifas, horarios y gana dinero en tu comunidad."
            gradientClasses="bg-gradient-to-br from-primary-light to-primary-lighter"
          />
        </div>
      </section>

      {/* API DOG FACTS
      <section className="px-6 py-20 bg-base">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-secondary mb-6">
            🐶 Dato Curioso del Día
          </h2>

          <div
            className="p-6 rounded-xl shadow-md mx-auto text-lg font-medium leading-relaxed bg-gradient-to-br from-primary-light to-primary-lighter"
            style={{
              border: "1px solid rgba(0,0,0,0.07)"
            }}
          >
            <DogFact />
          </div>

          <p className="mt-4 text-sm text-secondary/70">
            Cada día aprenderás algo nuevo sobre nuestros amigos peludos. 💛
          </p>
        </div>
      </section>
      
      */}

      {/* TESTIMONIOS */}
      <section id="nosotros" className="py-20 px-6 bg-base text-secondary">
        <h2 className="text-2xl font-bold text-center mb-10">Lo que dicen nuestros vecinos</h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Testimonial
            quote="¡Gracias a PetConnect, programé las vacunas de Max y las notificaciones me recordaron el día exacto. El control de salud es excelente!"
            name="Carlos R."
            role="Dueño de Max"
          />
          <Testimonial
            quote="Publicar solicitudes de cuidado es muy rápido. Conseguí una cuidadora de confianza en mi propia torre y pude ver el estado del servicio en tiempo real."
            name="Ana G."
            role="Dueña de Luna"
          />
          <Testimonial
            quote="Como cuidadora, configuro mi tarifa y horarios fácilmente. Ya he completado varios paseos en el conjunto y el sistema de postulación única me encanta."
            name="Sofía M."
            role="Cuidadora autorizada"
          />
        </div>
      </section>

      {/* ÚNETE */}
      <section className="px-6 py-20 text-center">
        <div className="rounded-xl p-10 space-y-6 bg-gradient-to-r from-primary/15 to-primary-light/25">
          <h2 className="text-3xl font-bold text-black">
            Únete a la comunidad de Torres El Pedregal
          </h2>
          <p className="max-w-xl mx-auto">
            Regístrate hoy y empieza a disfrutar de todos los beneficios que PETCONNECT tiene para ti
            y tu mejor amigo.
          </p>
          <Link
            to="/register"
            className="text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all duration-300 transform-gpu bg-gradient-to-r from-primary to-primary-hover"
          >
            Registrarse Ahora
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contacto" className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/5975/5975441.png"
                  alt="logo"
                  className="w-9 h-9"
                />
                <span className="font-bold">PetConnect</span>
              </div>
              <p className="text-base text-sm">
                Conectando a los amantes de las mascotas en Torres El Pedregal.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Características</h3>
              <ul className="space-y-2 text-sm text-base/80">
                <li><a href="#funcionalidades" className="text-base">Perfiles de Mascotas</a></li>
                <li><a href="#funcionalidades" className="text-base">Compromisos Sanitarios</a></li>
                <li><a href="#funcionalidades" className="text-base">Solicitudes de Cuidado</a></li>
                <li><a href="#funcionalidades" className="text-base">Cuidado y Paseo Local</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm text-base">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Torres El Pedregal, Quito
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:info@petconnect.com" className="hover:text-primary">
                    info@petconnect.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+593123456789" className="hover:text-primary">
                    +593 123456789
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Síguenos</h3>
              <div className="flex gap-4 text-base">
                <a href="#" >Facebook</a>
                <a href="#" >Instagram</a>
                <a href="#" >Twitter</a>
              </div>
            </div>
          </div>

          <div className="border-t border-primary/50 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-base text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} PetConnect. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 text-sm text-base">
              <span>Hecho con</span>
              <FaHeart className="w-4 h-4 text-primary" />
              <span>para las mascotas</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

/* Subcomponentes */
const FeatureCard = ({ icon, title, text, gradientClasses }) => (
  <div
    className={`flex flex-col gap-3 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow ${gradientClasses}`}
    style={{ border: "1px solid rgba(0,0,0,0.05)" }}
  >
    <div className="text-primary text-3xl">{icon}</div>
    <h3 className="font-bold text-lg">{title}</h3>
    <p className="text-sm text-secondary/80">{text}</p>
  </div>
)

const Testimonial = ({ quote, name, role }) => (
  <div className="p-6 rounded-xl border border-primary-light bg-white shadow-sm flex flex-col justify-between">
    <p className="mb-4 text-secondary leading-relaxed">
      <FaQuoteLeft className="inline text-primary mr-2" /> {quote}
    </p>
    <div>
      <h4 className="font-bold text-sm text-secondary">{name}</h4>
      <p className="text-xs text-secondary/70">{role}</p>
    </div>
  </div>
)
