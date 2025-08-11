import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { DollarSign, PieChart, TrendingUp, AlertTriangle } from 'lucide-react'

const TripBudget = () => {
  const { id } = useParams()
  
  const budgetData = {
    totalBudget: 2500,
    spent: 1850,
    remaining: 650,
    categories: [
      { name: 'Transportation', budgeted: 800, spent: 650, color: '#3b82f6' },
      { name: 'Accommodation', budgeted: 900, spent: 720, color: '#10b981' },
      { name: 'Food & Dining', budgeted: 500, spent: 380, color: '#f59e0b' },
      { name: 'Activities', budgeted: 300, spent: 100, color: '#8b5cf6' }
    ],
    dailyBreakdown: [
      { date: 'Mar 15', planned: 250, actual: 280, overBudget: true },
      { date: 'Mar 16', planned: 300, actual: 275, overBudget: false },
      { date: 'Mar 17', planned: 200, actual: 195, overBudget: false },
      { date: 'Mar 18', planned: 350, actual: 320, overBudget: false },
      { date: 'Mar 19', planned: 180, actual: 0, overBudget: false }
    ]
  }

  const getPercentage = (spent, budgeted) => {
    return Math.round((spent / budgeted) * 100)
  }

  const getBudgetStatus = (spent, budgeted) => {
    const percentage = getPercentage(spent, budgeted)
    if (percentage > 100) return { color: 'text-red-600', status: 'Over Budget' }
    if (percentage > 80) return { color: 'text-yellow-600', status: 'Near Limit' }
    return { color: 'text-green-600', status: 'On Track' }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trip Budget & Cost Breakdown</h1>
        <p className="text-gray-600">Track your expenses and stay within budget</p>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-3 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            ${budgetData.totalBudget.toLocaleString()}
          </div>
          <div className="text-gray-600">Total Budget</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            ${budgetData.spent.toLocaleString()}
          </div>
          <div className="text-gray-600">Total Spent</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            ${budgetData.remaining.toLocaleString()}
          </div>
          <div className="text-gray-600">Remaining</div>
        </div>
      </div>

      <div className="grid grid-2 gap-8 mb-8">
        {/* Category Breakdown */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <PieChart size={20} />
            Cost Breakdown by Category
          </h2>
          
          <div className="space-y-4">
            {budgetData.categories.map((category, index) => {
              const status = getBudgetStatus(category.spent, category.budgeted)
              const percentage = getPercentage(category.spent, category.budgeted)
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <span className={`text-sm ${status.color}`}>
                      ${category.spent} / ${category.budgeted} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: category.color
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{status.status}</span>
                    <span>${category.budgeted - category.spent} remaining</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={20} />
            Daily Spending
          </h2>
          
          <div className="space-y-3">
            {budgetData.dailyBreakdown.map((day, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{day.date}</span>
                  {day.overBudget && (
                    <AlertTriangle size={16} className="text-red-500" />
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Planned: ${day.planned}
                    </span>
                    <span className={`font-medium ${day.overBudget ? 'text-red-600' : 'text-green-600'}`}>
                      Actual: ${day.actual}
                    </span>
                  </div>
                  {day.overBudget && (
                    <div className="text-xs text-red-600">
                      ${day.actual - day.planned} over budget
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Budget Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Consider free walking tours and museums</li>
              <li>• Look for lunch specials at restaurants</li>
              <li>• Use public transportation when possible</li>
              <li>• Book activities in advance for better rates</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetData.categories.some(cat => getPercentage(cat.spent, cat.budgeted) > 80) && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-600 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Budget Alerts</h3>
              <div className="space-y-1 text-sm text-yellow-800">
                {budgetData.categories
                  .filter(cat => getPercentage(cat.spent, cat.budgeted) > 80)
                  .map((cat, index) => (
                    <div key={index}>
                      • {cat.name}: {getPercentage(cat.spent, cat.budgeted)}% of budget used
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TripBudget
