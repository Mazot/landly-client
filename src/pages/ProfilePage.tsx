import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>

      <div className="card">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-4xl">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{user.username}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 text-sm">Username:</span>
                <p className="font-medium">{user.username}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">User ID:</span>
                <p className="font-medium text-xs text-gray-500">{user.id}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="btn-secondary w-full">Edit Profile</button>
              <button className="btn-secondary w-full">Change Password</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-4">My Organizations</h3>
        <p className="text-gray-600">
          You haven't created any organizations yet.
        </p>
        <button className="btn-primary mt-4">Create Organization</button>
      </div>
    </div>
  )
}
