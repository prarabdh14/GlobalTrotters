import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar,
  MapPin,
  Activity,
  Utensils,
  Home,
  Car,
  ShoppingBag,
  Coffee,
  Camera,
  Wifi,
  Gift,
  BarChart3,
  PieChart,
  Clock,
  AlertCircle
} from 'lucide-react';

const TripBudget = () => {
  const [budget, setBudget] = useState({
    total: 0,
    transport: 0,
    accommodation: 0,
    activities: 0,
    meals: 0,
    shopping: 0,
    misc: 0
  });

  const [expenses, setExpenses] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'misc',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: ''
  });

  const categories = [
    { key: 'transport', label: 'Transport', icon: Car, color: '#3b82f6' },
    { key: 'accommodation', label: 'Accommodation', icon: Home, color: '#10b981' },
    { key: 'activities', label: 'Activities', icon: Activity, color: '#f59e0b' },
    { key: 'meals', label: 'Meals', icon: Utensils, color: '#ef4444' },
    { key: 'shopping', label: 'Shopping', icon: ShoppingBag, color: '#8b5cf6' },
    { key: 'misc', label: 'Miscellaneous', icon: Gift, color: '#6b7280' }
  ];

  const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const remainingBudget = budget.total - totalSpent;
  const budgetPercentage = budget.total > 0 ? (totalSpent / budget.total) * 100 : 0;
  const isOverBudget = totalSpent > budget.total;

  // Calculate average cost per day
  const getAverageCostPerDay = () => {
    if (expenses.length === 0) return 0;
    
    const dates = [...new Set(expenses.map(exp => exp.date))];
    const totalDays = dates.length;
    
    return totalDays > 0 ? totalSpent / totalDays : 0;
  };

  // Get daily spending breakdown
  const getDailySpending = () => {
    const dailyData = {};
    
    expenses.forEach(expense => {
      const date = expense.date;
      if (!dailyData[date]) {
        dailyData[date] = 0;
      }
      dailyData[date] += expense.amount;
    });

    return Object.entries(dailyData)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Get overbudget days
  const getOverbudgetDays = () => {
    const dailySpending = getDailySpending();
    const averageDailyBudget = budget.total / 30; // Assuming 30-day trip, adjust as needed
    
    return dailySpending.filter(day => day.amount > averageDailyBudget);
  };

  // Get category breakdown for charts
  const getCategoryBreakdown = () => {
    const breakdown = {};
    
    categories.forEach(cat => {
      breakdown[cat.key] = expenses
        .filter(exp => exp.category === cat.key)
        .reduce((sum, exp) => sum + exp.amount, 0);
    });

    return breakdown;
  };

  // Calculate pie chart data
  const getPieChartData = () => {
    const breakdown = getCategoryBreakdown();
    const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    
    return categories.map(cat => ({
      ...cat,
      value: breakdown[cat.key],
      percentage: total > 0 ? (breakdown[cat.key] / total) * 100 : 0
    })).filter(item => item.value > 0);
  };

  const getCategoryTotal = (category) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  const handleAddExpense = () => {
    if (newExpense.amount && newExpense.description) {
      const expense = {
        id: Date.now(),
        ...newExpense,
        amount: parseFloat(newExpense.amount)
      };
      setExpenses([...expenses, expense]);
      setNewExpense({
        amount: '',
        category: 'misc',
        description: '',
        date: new Date().toISOString().split('T')[0],
        location: ''
      });
      setShowAddExpense(false);
    }
  };

  const handleEditExpense = () => {
    if (editingExpense && editingExpense.amount && editingExpense.description) {
      setExpenses(expenses.map(exp => 
        exp.id === editingExpense.id ? { ...editingExpense, amount: parseFloat(editingExpense.amount) } : exp
      ));
      setEditingExpense(null);
    }
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.key === category);
    return cat ? cat.icon : Gift;
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.key === category);
    return cat ? cat.color : '#6b7280';
  };

  const averageDailyCost = getAverageCostPerDay();
  const dailySpending = getDailySpending();
  const overbudgetDays = getOverbudgetDays();
  const pieChartData = getPieChartData();

  return (
    <div className="min-h-screen py-8 animate-fade-in-up">
      <div className="container">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="text-4xl font-bold text-white mb-4">
            <DollarSign className="inline-block mr-3 text-green-400" size={40} />
            Trip Budget Manager
          </h1>
          <p className="text-gray-300 text-lg">Track your expenses and stay within budget</p>
        </div>

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card hover-lift animate-fade-in-up stagger-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Budget</p>
                <p className="text-2xl font-bold text-white">₹{budget.total.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <DollarSign className="text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card hover-lift animate-fade-in-up stagger-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-white">₹{totalSpent.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-full">
                <TrendingUp className="text-red-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card hover-lift animate-fade-in-up stagger-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Remaining</p>
                <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{remainingBudget.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-full ${remainingBudget >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <DollarSign className={remainingBudget >= 0 ? 'text-green-400' : 'text-red-400'} size={24} />
              </div>
            </div>
          </div>

          <div className="card hover-lift animate-fade-in-up stagger-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg/Day</p>
                <p className="text-2xl font-bold text-white">₹{averageDailyCost.toFixed(0)}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Clock className="text-purple-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="card mb-8 animate-fade-in-up stagger-5">
          <h3 className="text-xl font-semibold text-white mb-4">Budget Progress</h3>
          <div className="relative">
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${
                  isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-green-500'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              ></div>
            </div>
            {isOverBudget && (
              <div className="flex items-center mt-2 text-red-400">
                <AlertTriangle size={16} className="mr-2" />
                <span className="text-sm">Over budget by ₹{Math.abs(remainingBudget).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="card animate-fade-in-left">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <PieChart size={20} />
              Expense Distribution
            </h3>
            <div className="space-y-4">
              {pieChartData.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <PieChart size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No expenses recorded yet</p>
                </div>
              ) : (
                pieChartData.map((item, index) => (
                  <div key={item.key} className="animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{backgroundColor: `${item.color}20`}}>
                          <item.icon size={16} style={{color: item.color}} />
                        </div>
                        <span className="text-gray-300">{item.label}</span>
                      </div>
                      <span className="text-white font-semibold">₹{item.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{item.percentage.toFixed(1)}% of total</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bar Chart - Daily Spending */}
          <div className="card animate-fade-in-right">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 size={20} />
              Daily Spending Trend
            </h3>
            <div className="space-y-4">
              {dailySpending.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No daily spending data yet</p>
                </div>
              ) : (
                dailySpending.map((day, index) => {
                  const maxAmount = Math.max(...dailySpending.map(d => d.amount));
                  const barHeight = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                  const isOverbudget = day.amount > (budget.total / 30); // Assuming 30-day trip
                  
                  return (
                    <div key={day.date} className="animate-fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
                      <div className="flex items-center gap-4">
                        <div className="w-20 text-sm text-gray-400">
                          {new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex-1 bg-gray-700 rounded-full h-4 relative">
                          <div 
                            className={`h-4 rounded-full transition-all duration-500 ${
                              isOverbudget ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${barHeight}%` }}
                          ></div>
                        </div>
                        <div className="w-20 text-right">
                          <span className={`text-sm font-semibold ${isOverbudget ? 'text-red-400' : 'text-white'}`}>
                            ₹{day.amount.toLocaleString()}
                          </span>
                          {isOverbudget && (
                            <AlertCircle size={12} className="text-red-400 ml-1 inline" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Overbudget Alerts */}
        {overbudgetDays.length > 0 && (
          <div className="card mb-8 animate-fade-in-up stagger-6 bg-red-500/10 border-red-500/20">
            <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              Overbudget Day Alerts
            </h3>
            <div className="space-y-3">
              {overbudgetDays.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-red-400" />
                    <span className="text-white">
                      {new Date(day.date).toLocaleDateString('en-IN', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-red-400 font-semibold">₹{day.amount.toLocaleString()}</span>
                    <p className="text-xs text-red-300">
                      {((day.amount / (budget.total / 30)) * 100).toFixed(0)}% of daily budget
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Setup Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Budget Allocation */}
          <div className="card animate-fade-in-left">
            <h3 className="text-xl font-semibold text-white mb-6">Set Your Budget</h3>
            <div className="space-y-4">
              {Object.entries(budget).map(([key, value]) => (
                key !== 'total' && (
                  <div key={key} className="flex items-center gap-4">
                    <div className="w-32 text-gray-300">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setBudget({...budget, [key]: parseFloat(e.target.value) || 0})}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                )
              ))}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-600">
                <div className="w-32 text-white font-semibold">Total</div>
                <div className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white font-semibold">
                  ₹{Object.values(budget).reduce((sum, val) => sum + (val || 0), 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Expense Categories Chart */}
          <div className="card animate-fade-in-right">
            <h3 className="text-xl font-semibold text-white mb-6">Expense Breakdown</h3>
            <div className="space-y-4">
              {categories.map((category, index) => {
                const spent = getCategoryTotal(category.key);
                const budgeted = budget[category.key] || 0;
                const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
                const IconComponent = category.icon;
                
                return (
                  <div key={category.key} className="animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{backgroundColor: `${category.color}20`}}>
                          <IconComponent size={16} style={{color: category.color}} />
                        </div>
                        <span className="text-gray-300">{category.label}</span>
                      </div>
                      <span className="text-white font-semibold">₹{spent.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: percentage > 100 ? '#ef4444' : category.color
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Budget: ₹{budgeted.toLocaleString()}</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="card animate-fade-in-up stagger-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Expenses</h3>
            <button
              onClick={() => setShowAddExpense(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Add Expense
            </button>
          </div>

          {/* Add Expense Modal */}
          {showAddExpense && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in-up">
              <div className="card max-w-md w-full mx-4">
                <h4 className="text-lg font-semibold text-white mb-4">Add New Expense</h4>
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Location (optional)"
                    value={newExpense.location}
                    onChange={(e) => setNewExpense({...newExpense, location: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddExpense}
                      className="btn btn-primary flex-1"
                    >
                      Add Expense
                    </button>
                    <button
                      onClick={() => setShowAddExpense(false)}
                      className="btn btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Expense Modal */}
          {editingExpense && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in-up">
              <div className="card max-w-md w-full mx-4">
                <h4 className="text-lg font-semibold text-white mb-4">Edit Expense</h4>
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({...editingExpense, amount: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={editingExpense.category}
                    onChange={(e) => setEditingExpense({...editingExpense, category: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Description"
                    value={editingExpense.description}
                    onChange={(e) => setEditingExpense({...editingExpense, description: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={editingExpense.date}
                    onChange={(e) => setEditingExpense({...editingExpense, date: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Location (optional)"
                    value={editingExpense.location}
                    onChange={(e) => setEditingExpense({...editingExpense, location: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleEditExpense}
                      className="btn btn-primary flex-1"
                    >
                      Update Expense
                    </button>
                    <button
                      onClick={() => setEditingExpense(null)}
                      className="btn btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expenses List */}
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
                <p>No expenses recorded yet. Add your first expense to get started!</p>
              </div>
            ) : (
              expenses.map((expense, index) => {
                const IconComponent = getCategoryIcon(expense.category);
                const categoryColor = getCategoryColor(expense.category);
                
                return (
                  <div 
                    key={expense.id} 
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-300 animate-fade-in-up"
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg" style={{backgroundColor: `${categoryColor}20`}}>
                        <IconComponent size={20} style={{color: categoryColor}} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{expense.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                          {expense.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {expense.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">₹{expense.amount.toLocaleString()}</span>
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripBudget;
