import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import Layout from "./components/Layout"
import Profile from "./pages/Profile"
import Login from "./pages/Login"
import Register from "./pages/Register"
import CustomerDashboardLayout from "./components/CustomerDashboardLayout"
import CustomerOverview from "./pages/CustomerOverview"
import TransferMoney from "./pages/TransferMoney"
import CustomerProfile from "./pages/CustomerProfile"
import CustomerSettings from "./pages/CustomerSettings"
import CustomerLoans from "./pages/CustomerLoans"
import CustomerTransactions from "./pages/CustomerTransactions"
import CustomerAccount from "./pages/CustomerAccount"
import { useGetUserQuery } from "./api/authApi"
import ProtectedRoute from "./components/ProtectedRoute"
import Loader from "./components/Loader"
import EmployeeDashboardLayout from "./components/EmployeeDashboardLayout"
import EmployeeOverview from "./pages/EmployeeOverview"
import CashRequests from "./pages/CashRequests"
import LoanApplications from "./pages/LoanApplications"
import ApprovedLoans from "./pages/ApprovedLoans"
import ManageAccounts from "./pages/ManageCustomers"
import AllCustomers from "./pages/AllCustomers"
import Toaster from 'react-hot-toast'
import NotificationsPage from "./pages/Notifications"
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications"

function App() {
  const { isLoading, isError } = useGetUserQuery();
  useRealtimeNotifications();
  const user = {
    avatar:'https://avatars.githubusercontent.com/u/121487855?v=4',
    name:'Ashish Bind'
  }

  if (isLoading) {
    return <Loader/>
  }

  // if (isError) {
  //   return <Navigate to="/login" replace />;
  // }

  return (
    <Routes>
  
      <Route path="/" element={<Layout/>}>

        <Route index element={<Home/>}/>
        <Route path="login" element={<Login />}/>
        <Route path="register" element={<Register />}/>
      </Route>

      <Route 
        element={<ProtectedRoute roles="customer" fallback="/" />}
      >
      <Route path="/customer" element={<CustomerDashboardLayout/>}>
        <Route path="dashboard" element={<CustomerOverview />} />
        {/* <Route path="profile" element={<Profile/>}/> */}
      <Route path="accounts" element={<CustomerAccount />} />
      <Route path="transactions" element={<CustomerTransactions />} />
      <Route path="loans" element={<CustomerLoans />} />
      <Route path="transfer" element={<TransferMoney />} />
      <Route path="profile" element={<CustomerProfile />} />
      <Route path="settings" element={<CustomerSettings />} />
      <Route path="notifications" element={<NotificationsPage />} />
      </Route>
    </Route>
      <Route 
        element={<ProtectedRoute roles="employee" fallback="/" />}
      >
      <Route path="/employee" element={<EmployeeDashboardLayout/>}>
        <Route path="dashboard" element={<EmployeeOverview />} />
        <Route path="cash-requests" element={<CashRequests />} />
        <Route path="loan-applications" element={<LoanApplications/>}/>
        <Route path="approved-loans" element={<ApprovedLoans/>}/>
        <Route path="customers" element={<AllCustomers/>}/>
        <Route path="accounts" element={<ManageAccounts/>}/>
        <Route path="notifications" element={<NotificationsPage/>}/>
      </Route>
    </Route>
    </Routes>
  )
}

export default App
