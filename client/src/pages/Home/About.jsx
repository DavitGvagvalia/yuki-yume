export default function About() {
  return (
    <section
      id="about"
      className="
        scroll-mt-16
        py-20
        px-4
        bg-surface
      "
    >
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-text mb-6">
          About Yuki Yume
        </h2>

        <p className="text-text-secondary text-lg leading-relaxed mb-6">
          <span className="font-semibold text-text">Yuki Yume</span> is a modern
          Japanese-inspired sushi restaurant where precision, simplicity, and
          imagination meet. Every roll is crafted with care, balancing tradition
          and creativity.
        </p>

        <p className="text-muted leading-relaxed max-w-3xl mx-auto">
          We believe sushi is not just food — it’s an experience. From carefully
          selected ingredients to minimal presentation, our goal is to make every
          order feel special, whether you dine in or order delivery.
        </p>
      </div>
    </section>
  );
}
