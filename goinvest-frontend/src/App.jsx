import { useState, useEffect } from 'react'
import './App.css'
import {
  setContractAddress,
  getAllProposals,
  getProposal,
  submitProposal,
  invest,
  getInvestment,
  getProposalCount
} from './utils/soroban'

function App() {
  const [contractAddress, setContractAddressState] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentView, setCurrentView] = useState('view') // 'view', 'submit', 'invest', 'myInvestments'
  const [userAddress, setUserAddress] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [submitForm, setSubmitForm] = useState({
    title: '',
    description: '',
    goalAmount: ''
  })

  const [investForm, setInvestForm] = useState({
    proposalId: '',
    amount: ''
  })

  const [myInvestments, setMyInvestments] = useState({})

  // Connect to contract
  const handleConnect = () => {
    if (!contractAddress.trim()) {
      setError('Please enter a contract address')
      return
    }
    setContractAddress(contractAddress)
    setIsConnected(true)
    setError('')
    loadProposals()
  }

  // Load all proposals
  const loadProposals = async () => {
    try {
      setLoading(true)
      setError('')
      const proposalCount = await getProposalCount()
      const loadedProposals = []

      for (let i = 1; i <= proposalCount; i++) {
        try {
          const proposal = await getProposal(i)
          loadedProposals.push({
            id: i,
            ...proposal
          })
        } catch (err) {
          console.error(`Failed to load proposal ${i}:`, err)
        }
      }

      setProposals(loadedProposals)
      setSuccess(`Loaded ${loadedProposals.length} proposals`)
    } catch (err) {
      setError('Failed to load proposals: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle submit proposal
  const handleSubmitProposal = async (e) => {
    e.preventDefault()
    if (!userAddress.trim()) {
      setError('Please enter your Stellar address')
      return
    }
    if (!submitForm.title || !submitForm.description || !submitForm.goalAmount) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      setError('')
      const goalAmount = Math.floor(parseFloat(submitForm.goalAmount) * 10000000) // Convert XLM to stroops
      
      const proposalId = await submitProposal(
        userAddress,
        submitForm.title,
        submitForm.description,
        goalAmount
      )

      setSuccess(`Proposal submitted with ID: ${proposalId}`)
      setSubmitForm({ title: '', description: '', goalAmount: '' })
      loadProposals()
      setCurrentView('view')
    } catch (err) {
      setError('Failed to submit proposal: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle invest
  const handleInvest = async (e) => {
    e.preventDefault()
    if (!userAddress.trim()) {
      setError('Please enter your Stellar address')
      return
    }
    if (!investForm.proposalId || !investForm.amount) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      setError('')
      const amount = Math.floor(parseFloat(investForm.amount) * 10000000) // Convert XLM to stroops
      
      await invest(userAddress, parseInt(investForm.proposalId), amount)
      
      setSuccess('Investment successful!')
      setInvestForm({ proposalId: '', amount: '' })
      loadProposals()
      setCurrentView('view')
    } catch (err) {
      setError('Failed to invest: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load my investments
  const handleLoadMyInvestments = async () => {
    if (!userAddress.trim()) {
      setError('Please enter your Stellar address')
      return
    }

    try {
      setLoading(true)
      setError('')
      const investments = {}

      for (let i = 1; i <= proposals.length; i++) {
        const amount = await getInvestment(i, userAddress)
        if (amount && amount !== '0') {
          investments[i] = (parseInt(amount) / 10000000).toFixed(7) // Convert stroops to XLM
        }
      }

      setMyInvestments(investments)
      setSuccess(`Loaded ${Object.keys(investments).length} investments`)
    } catch (err) {
      setError('Failed to load investments: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Format stroops to XLM
  const stroopsToXLM = (stroops) => {
    return (parseInt(stroops || '0') / 10000000).toFixed(7)
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 GoInvest - Soroban Smart Contract Frontend</h1>
        <p>Decentralized Investment Platform</p>
      </header>

      <main>
        {/* Connection Section */}
        {!isConnected ? (
          <section className="connection-section">
            <h2>Connect to Smart Contract</h2>
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter contract address (CA...)"
                value={contractAddress}
                onChange={(e) => setContractAddressState(e.target.value)}
              />
              <button onClick={handleConnect} disabled={loading}>
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="connection-status">
              <p>✅ Connected to contract: <code>{contractAddress.substring(0, 15)}...</code></p>
              <div className="user-address">
                <input
                  type="text"
                  placeholder="Your Stellar address (GXXX...)"
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                />
              </div>
            </section>

            {/* Navigation */}
            <nav className="nav-buttons">
              <button
                className={currentView === 'view' ? 'active' : ''}
                onClick={() => setCurrentView('view')}
              >
                📋 View Proposals
              </button>
              <button
                className={currentView === 'submit' ? 'active' : ''}
                onClick={() => setCurrentView('submit')}
              >
                ➕ Create Proposal
              </button>
              <button
                className={currentView === 'invest' ? 'active' : ''}
                onClick={() => setCurrentView('invest')}
              >
                💰 Invest
              </button>
              <button
                className={currentView === 'myInvestments' ? 'active' : ''}
                onClick={() => {
                  setCurrentView('myInvestments')
                  handleLoadMyInvestments()
                }}
              >
                💼 My Investments
              </button>
            </nav>

            {/* Messages */}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* View Proposals */}
            {currentView === 'view' && (
              <section className="proposals-section">
                <h2>All Proposals</h2>
                <button onClick={loadProposals} disabled={loading} className="refresh-btn">
                  {loading ? 'Loading...' : '🔄 Refresh'}
                </button>
                {proposals.length === 0 ? (
                  <p className="no-data">No proposals yet. Be the first to create one!</p>
                ) : (
                  <div className="proposals-grid">
                    {proposals.map((proposal) => (
                      <div key={proposal.id} className="proposal-card">
                        <h3>{proposal.title || `Proposal #${proposal.id}`}</h3>
                        <p className="description">{proposal.description || 'No description'}</p>
                        <div className="proposal-stats">
                          <div className="stat">
                            <span>Goal:</span>
                            <strong>{stroopsToXLM(proposal.goal_amount)} XLM</strong>
                          </div>
                          <div className="stat">
                            <span>Raised:</span>
                            <strong>{stroopsToXLM(proposal.raised_amount)} XLM</strong>
                          </div>
                          <div className="stat">
                            <span>Status:</span>
                            <strong>{proposal.is_active ? '🟢 Active' : '🔴 Closed'}</strong>
                          </div>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.min(
                                (parseInt(proposal.raised_amount) / parseInt(proposal.goal_amount)) * 100,
                                100
                              )}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Submit Proposal */}
            {currentView === 'submit' && (
              <section className="form-section">
                <h2>Create New Proposal</h2>
                <form onSubmit={handleSubmitProposal}>
                  <div className="form-group">
                    <label>Proposal Title</label>
                    <input
                      type="text"
                      placeholder="e.g., New Product Launch"
                      value={submitForm.title}
                      onChange={(e) =>
                        setSubmitForm({ ...submitForm, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      placeholder="Describe your proposal..."
                      value={submitForm.description}
                      onChange={(e) =>
                        setSubmitForm({ ...submitForm, description: e.target.value })
                      }
                      rows="4"
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Funding Goal (XLM)</label>
                    <input
                      type="number"
                      placeholder="e.g., 1000"
                      step="0.0000001"
                      value={submitForm.goalAmount}
                      onChange={(e) =>
                        setSubmitForm({ ...submitForm, goalAmount: e.target.value })
                      }
                    />
                  </div>
                  <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Proposal'}
                  </button>
                </form>
              </section>
            )}

            {/* Invest */}
            {currentView === 'invest' && (
              <section className="form-section">
                <h2>Invest in a Proposal</h2>
                <form onSubmit={handleInvest}>
                  <div className="form-group">
                    <label>Proposal ID</label>
                    <input
                      type="number"
                      placeholder="Enter proposal ID"
                      value={investForm.proposalId}
                      onChange={(e) =>
                        setInvestForm({ ...investForm, proposalId: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Investment Amount (XLM)</label>
                    <input
                      type="number"
                      placeholder="e.g., 100"
                      step="0.0000001"
                      value={investForm.amount}
                      onChange={(e) =>
                        setInvestForm({ ...investForm, amount: e.target.value })
                      }
                    />
                  </div>
                  <button type="submit" disabled={loading}>
                    {loading ? 'Investing...' : 'Invest Now'}
                  </button>
                </form>
              </section>
            )}

            {/* My Investments */}
            {currentView === 'myInvestments' && (
              <section className="investments-section">
                <h2>My Investments</h2>
                {Object.keys(myInvestments).length === 0 ? (
                  <p className="no-data">You haven't invested in any proposals yet.</p>
                ) : (
                  <div className="investments-list">
                    {Object.entries(myInvestments).map(([proposalId, amount]) => (
                      <div key={proposalId} className="investment-item">
                        <span className="proposal-id">Proposal #{proposalId}</span>
                        <span className="amount">{amount} XLM</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
