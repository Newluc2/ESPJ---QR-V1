import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../services/api'
import { LogOut, Users, QrCode, RefreshCw, Download, Plus } from 'lucide-react'

function AdminDashboard() {
  const [attendance, setAttendance] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [newUser, setNewUser] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    birthDate: ''
  })
  const [showAddUser, setShowAddUser] = useState(false)
  const navigate = useNavigate()

  // Load data
  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [attendanceRes, usersRes] = await Promise.all([
        adminService.getTodayAttendance(),
        adminService.getAllUsers()
      ])
      
      setAttendance(attendanceRes.data)
      setUsers(usersRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
      if (error.response?.status === 401) {
        handleLogout()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  const handleGenerateQR = async (userId) => {
    try {
      const response = await adminService.generateQRCode(userId)
      setQrCode(response.data)
      setSelectedUser(userId)
      setShowQR(true)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      await adminService.addUser(newUser)
      setNewUser({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        birthDate: ''
      })
      setShowAddUser(false)
      loadData()
    } catch (error) {
      console.error('Error adding user:', error)
    }
  }

  const downloadQRCode = () => {
    if (!qrCode) return
    
    const link = document.createElement('a')
    link.href = qrCode.qrCode
    link.download = `qrcode-${qrCode.userId}.png`
    link.click()
  }

  if (loading && attendance.length === 0 && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Admin</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Attendance Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users size={24} />
                  Pointages d'Aujourd'hui
                </h2>
                <button
                  onClick={loadData}
                  className="text-indigo-600 hover:text-indigo-700"
                  title="Actualiser"
                >
                  <RefreshCw size={20} />
                </button>
              </div>

              {attendance.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Aucun pointage pour aujourd'hui
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Prénom</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Arrivée</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Sortie</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attendance.map((record, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{record.lastName}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{record.firstName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                              {record.arrivalTime}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {record.departureTime !== '-' ? (
                              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                                {record.departureTime}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              record.status === 'Présent' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code Display */}
            {showQR && qrCode && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <QrCode size={20} />
                  Code QR
                </h3>
                <div className="flex flex-col items-center">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <img 
                      src={qrCode.qrCode} 
                      alt="QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  <button
                    onClick={downloadQRCode}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    <Download size={20} />
                    Télécharger
                  </button>
                  <button
                    onClick={() => setShowQR(false)}
                    className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}

            {/* Add User Form */}
            {showAddUser && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus size={20} />
                  Ajouter un Utilisateur
                </h3>
                <form onSubmit={handleAddUser} className="space-y-3">
                  <input
                    type="text"
                    placeholder="ID"
                    value={newUser.id}
                    onChange={(e) => setNewUser({ ...newUser, id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Nom"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <input
                    type="text"
                    placeholder="Date de naissance (JJ/MM/AAAA)"
                    value={newUser.birthDate}
                    onChange={(e) => setNewUser({ ...newUser, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Ajouter
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Annuler
                  </button>
                </form>
              </div>
            )}

            {/* Users List */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users size={20} />
                  Utilisateurs
                </h3>
              </div>
              <div className="px-6 py-4">
                <button
                  onClick={() => setShowAddUser(!showAddUser)}
                  className="w-full flex items-center justify-center gap-2 mb-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  <Plus size={20} />
                  Ajouter un Utilisateur
                </button>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleGenerateQR(user.id)}
                        className="w-full text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold py-1 px-2 rounded transition"
                      >
                        Générer QR
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
