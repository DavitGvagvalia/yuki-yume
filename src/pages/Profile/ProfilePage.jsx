import { useState } from "react";

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSaving(true);

    // simulate API call
    await new Promise(r => setTimeout(r, 800));

    setIsSaving(false);
    alert("Profile saved");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pt-24">
      <h1 className="mb-6 text-2xl font-semibold text-text">
        Profile
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl bg-background p-6 shadow"
      >
        {/* ---------- Personal ---------- */}
        <Section title="Personal information">
          <Input
            label="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@email.com"
          />

          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+995 5xx xx xx xx"
          />
        </Section>

        {/* ---------- Location ---------- */}
        <Section title="Delivery address">
          <Input
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
          />

          <Input
            label="Street address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          <Textarea
            label="Delivery notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Entrance, floor, door code…"
          />
        </Section>

        {/* ---------- Submit ---------- */}
        <button
          disabled={isSaving}
          className="
            w-full
            rounded-md
            bg-accent
            py-2
            text-background
            transition
            hover:bg-accent-hover
            disabled:cursor-not-allowed
            disabled:bg-gray-400
          "
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

/* ---------- Small reusable components ---------- */

function Section({ title, children }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-muted">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted">
        {label}
      </span>
      <input
        {...props}
        className="
          w-full
          rounded-md
          border
          border-border
          bg-transparent
          px-3
          py-2
          text-text
          outline-none
          focus:border-accent
        "
      />
    </label>
  );
}

function Textarea({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted">
        {label}
      </span>
      <textarea
        {...props}
        rows={3}
        className="
          w-full
          rounded-md
          border
          border-border
          bg-transparent
          px-3
          py-2
          text-text
          outline-none
          focus:border-accent
        "
      />
    </label>
  );
}
