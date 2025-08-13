import express from 'express'
const app = express()

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Habit Tracker API',
  })
})

// export the app for use in other modules (like tests)
export { app }

// default export for convenience
export default app
