import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { formatINR } from '@/lib/utils';
import { User, Wallet, Target, Calendar, LogOut, Save, Plus, X, Edit2 } from 'lucide-react';
import { RoutineExpense } from '@/types/user';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateSettings, logout } = useUser();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    age: user?.age || 18,
    role: user?.role || 'studying',
    monthlyAllowance: user?.monthlyAllowance || 0,
    salary: user?.salary || 0,
    sideIncome: user?.sideIncome || 0,
    dailyLimit: user?.dailyLimit || 0,
    weeklyLimit: user?.weeklyLimit || 0,
    monthlyLimit: user?.monthlyLimit || 0,
  });

  const [routineExpenses, setRoutineExpenses] = useState<RoutineExpense[]>(user?.routineExpenses || []);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '' });

  const handleSave = () => {
    updateSettings({
      ...editData,
      routineExpenses,
    });
    setIsEditing(false);
    toast({
      title: 'Profile updated!',
      description: 'Your changes have been saved.',
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: 'Logged out',
      description: 'See you next time!',
    });
  };

  const addRoutineExpense = () => {
    if (newExpense.name && newExpense.amount) {
      const expense: RoutineExpense = {
        id: Date.now().toString(),
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        category: 'routine',
      };
      setRoutineExpenses([...routineExpenses, expense]);
      setNewExpense({ name: '', amount: '' });
    }
  };

  const removeRoutineExpense = (id: string) => {
    setRoutineExpenses(routineExpenses.filter(e => e.id !== id));
  };

  const totalIncome = (user?.monthlyAllowance || 0) + (user?.salary || 0) + (user?.sideIncome || 0);
  const totalRoutineDaily = routineExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <User className="h-7 w-7 text-primary" />
              Profile
            </h1>
            <p className="text-muted-foreground text-sm">Manage your account settings</p>
          </div>
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
        </div>

        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={editData.age}
                    onChange={(e) => setEditData({ ...editData, age: parseInt(e.target.value) || 18 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <RadioGroup
                    value={editData.role}
                    onValueChange={(value) => setEditData({ ...editData, role: value as 'studying' | 'working' | 'both' })}
                    className="flex gap-4"
                  >
                    {['studying', 'working', 'both'].map((role) => (
                      <Label
                        key={role}
                        htmlFor={`role-${role}`}
                        className={`flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                          editData.role === role ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <RadioGroupItem value={role} id={`role-${role}`} className="sr-only" />
                        <span className="capitalize">{role}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium">{user.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{user.role}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Income Details
            </CardTitle>
            <CardDescription>Total Monthly: {formatINR(totalIncome)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="allowance">Monthly Allowance (₹)</Label>
                  <Input
                    id="allowance"
                    type="number"
                    value={editData.monthlyAllowance || ''}
                    onChange={(e) => setEditData({ ...editData, monthlyAllowance: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary (₹)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={editData.salary || ''}
                    onChange={(e) => setEditData({ ...editData, salary: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sideIncome">Side Income (₹)</Label>
                  <Input
                    id="sideIncome"
                    type="number"
                    value={editData.sideIncome || ''}
                    onChange={(e) => setEditData({ ...editData, sideIncome: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allowance</span>
                  <span className="font-medium">{formatINR(user.monthlyAllowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salary</span>
                  <span className="font-medium">{formatINR(user.salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Side Income</span>
                  <span className="font-medium">{formatINR(user.sideIncome)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Budget Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="dailyLimit">Daily Limit (₹)</Label>
                  <Input
                    id="dailyLimit"
                    type="number"
                    value={editData.dailyLimit}
                    onChange={(e) => setEditData({ ...editData, dailyLimit: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeklyLimit">Weekly Limit (₹)</Label>
                  <Input
                    id="weeklyLimit"
                    type="number"
                    value={editData.weeklyLimit || ''}
                    onChange={(e) => setEditData({ ...editData, weeklyLimit: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyLimit">Monthly Limit (₹)</Label>
                  <Input
                    id="monthlyLimit"
                    type="number"
                    value={editData.monthlyLimit || ''}
                    onChange={(e) => setEditData({ ...editData, monthlyLimit: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily</span>
                  <span className="font-medium">{formatINR(user.dailyLimit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weekly</span>
                  <span className="font-medium">{user.weeklyLimit ? formatINR(user.weeklyLimit) : 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly</span>
                  <span className="font-medium">{user.monthlyLimit ? formatINR(user.monthlyLimit) : 'Not set'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Routine Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Routine Expenses
            </CardTitle>
            <CardDescription>Total: {formatINR(totalRoutineDaily)}/day</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing expenses */}
            {routineExpenses.length > 0 && (
              <div className="space-y-2">
                {routineExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <span>{expense.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatINR(expense.amount)}</span>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeRoutineExpense(expense.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new expense */}
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Expense name"
                  value={newExpense.name}
                  onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="₹"
                  className="w-24"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
                <Button variant="outline" size="icon" onClick={addRoutineExpense}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {routineExpenses.length === 0 && !isEditing && (
              <p className="text-muted-foreground text-sm text-center py-4">
                No routine expenses set. Click Edit to add some.
              </p>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </AppLayout>
  );
};

export default Profile;
