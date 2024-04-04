import React, { useContext, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import app from '../../base'
import { AuthContext } from '../../Auth'

const auth = getAuth(app)

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const { currentUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch (error) {
      setError(error.message)
    }
  }

  if (currentUser) {
    navigate('/dashboard')
  }

  return (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',    // Center horizontally
        justifyContent: 'center',  // Center vertically
        height: '100vh'
    }}>
      <form onSubmit={handleLogin} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '400px',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            marginBottom: '10px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '100%',
            fontSize: '16px',
            color: 'black'
          }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            marginBottom: '10px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '100%',
            fontSize: '16px',
            color: 'black'
          }}
          required
        />
        <button type="submit" style={{
          padding: '15px',
          backgroundColor: '#3cb261',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          width: '100%',
          cursor: 'pointer',
          fontSize: '18px'
        }}>
          Login
        </button>
        {error && <p style={{
          color: 'red',
          marginTop: '10px',
          fontSize: '16px'
        }}>{error}</p>}
      </form>
      <Link to="/reset" style={{
        marginTop: '20px',
        textDecoration: 'none',
        color: '#007bff',
        fontSize: '16px'
      }}>
        Forgot Password?
      </Link>
      {/* Outlet to render child routes */}
      <Outlet />
    </div>
  )
}

export default Login