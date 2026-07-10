import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import logo from "../Assets/olivarezlogo.png";

const footerLinks = [
  { label: "Home", path: "/" },
  { label: "About", scrollTo: "about" },
  { label: "Services", scrollTo: "services" },
  { label: "Find A Doctor", path: "/FindDoctor" },
  { label: "Book an Appointment", path: "/BookAppointment" },
  { label: "Contact", scrollTo: "contact" },
];

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleScrollClick = (targetId) => (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      // Pass the target section in state to the home page
      navigate("/", { state: { scrollTo: targetId } });
    } else {
      // Smooth scroll if already on the home page
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="bg-green-900 text-green-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Olivarez General Hospital"
              className="h-[48px] w-auto object-contain"
            />
            <span className="text-lg font-bold text-white">
              Olivarez General Hospital
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-green-100/80">
            Dr. Arcadio Santos Ave, Parañaque City, 1700, Metro Manila
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-white">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2">
            {footerLinks.map((item) =>
              item.scrollTo ? (
                <li key={item.label}>
                  <a
                    href={`/#${item.scrollTo}`}
                    onClick={handleScrollClick(item.scrollTo)}
                    className="text-sm text-green-100/80 transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ) : (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className="text-sm text-green-100/80 transition-colors hover:text-white"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-white">
            Get in Touch
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-green-100/80">
            <li>Dr. Arcadio Santos Ave, Parañaque City</li>
            <li>1700, Metro Manila, Philippines</li>
            <li>
              <a
                href="/#contact"
                onClick={handleScrollClick("contact")}
                className="transition-colors hover:text-white"
              >
                Send us a message
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-green-800">
        <p className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-green-100/70 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} Olivarez General Hospital. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
