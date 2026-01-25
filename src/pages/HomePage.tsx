import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Welcome to Landly 🌍
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Find businesses, helpers, and official representatives of different
          nationalities in foreign countries. Connect with culturally familiar
          services wherever you are.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/organizations" className="btn-primary text-lg px-8 py-3">
            Explore Organizations
          </Link>
          <Link to="/signup" className="btn-secondary text-lg px-8 py-3">
            Join Community
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="card text-center">
          <div className="text-4xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold mb-3">Business Discovery</h3>
          <p className="text-gray-600">
            Find businesses run by or catering to your nationality in any country
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold mb-3">Community Helpers</h3>
          <p className="text-gray-600">
            Connect with volunteers and community organizers who can help you settle
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">🏛️</div>
          <h3 className="text-xl font-semibold mb-3">Official Representatives</h3>
          <p className="text-gray-600">
            Locate embassies, consulates, and cultural centers easily
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-600 text-white rounded-lg p-12">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">10K+</div>
            <div className="text-primary-100">Organizations</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">150+</div>
            <div className="text-primary-100">Countries</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">50K+</div>
            <div className="text-primary-100">Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">100+</div>
            <div className="text-primary-100">Languages</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-8">
          Join thousands of people who found their community abroad
        </p>
        <Link to="/signup" className="btn-primary text-lg px-8 py-3">
          Create Free Account
        </Link>
      </section>
    </div>
  )
}
