import {
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function Contacts() {
  return (
    <section
      id="contacts"
      className="
        scroll-mt-16
        py-20
        px-4
        bg-background
      "
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-3">
            Contact Us
          </h2>
          <p className="text-muted">
            We’re here for orders, questions, and collaborations
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Phone */}
          <div className="flex flex-col items-center text-center gap-3">
            <PhoneIcon className="w-8 h-8 text-accent" />
            <h4 className="text-lg font-semibold text-text">Phone</h4>
            <a
              href="tel:+995555123456"
              className="text-muted hover:text-text transition"
            >
              +995 555 32 88 09
            </a>
          </div>

          {/* Address */}
          <div className="flex flex-col items-center text-center gap-3">
            <MapPinIcon className="w-8 h-8 text-accent" />
            <h4 className="text-lg font-semibold text-text">Address</h4>
            <p className="text-muted">
              Tbilisi, Georgia
              <br />
              (Delivery & Pickup)
            </p>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center text-center gap-3">
            <ClockIcon className="w-8 h-8 text-accent" />
            <h4 className="text-lg font-semibold text-text">Working Hours</h4>
            <p className="text-muted">
              Mon – Sun
              <br />
              14:00 - 00:00
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 flex justify-center">
          <a
            href="/menu"
            className="
              px-8
              py-3
              rounded-md
              bg-accent
              text-background
              font-medium
              hover:bg-accent-hover
              transition
            "
          >
            Order Now
          </a>
        </div>
      </div>
    </section>
  );
}
