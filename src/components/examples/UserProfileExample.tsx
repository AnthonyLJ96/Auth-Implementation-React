import React from 'react';
// import { useAuth, useProfile } from '../../hooks';
//
// /**
//  * Example component showing BEST PRACTICES for using hooks
//  *
//  * ✅ AFTER: Clean separation of concerns
//  * - useAuth: handles authentication state
//  * - useProfile: handles user profile data
//  */
// export const UserProfileExample: React.FC = () => {
//     // ✅ Use specific hooks for specific purposes
//     const { isAuthenticated, isLoading: authLoading, login, logout } = useAuth();
//     const { user, isLoading: profileLoading, error, refetch } = useProfile();
//
//     // Handle loading states separately
//     if (authLoading || profileLoading) {
//         return <div>Loading...</div>;
//     }
//
//     if (!isAuthenticated) {
//         return (
//             <div>
//                 <h2>Please log in</h2>
//                 <button
//                     onClick={() => login({
//                         email: 'test@example.com',
//                         password: 'password'
//                     })}
//                 >
//                     Login
//                 </button>
//             </div>
//         );
//     }
//
//     if (error) {
//         return (
//             <div>
//                 <p>Error loading profile: {error}</p>
//                 <button onClick={refetch}>Retry</button>
//             </div>
//         );
//     }
//
//     return (
//         <div>
//             <h2>User Profile</h2>
//             {user ? (
//                 <div>
//                     <p><strong>Email:</strong> {user.email}</p>
//                     <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
//                     <p><strong>Staff:</strong> {user.is_staff ? 'Yes' : 'No'}</p>
//
//                     <div>
//                         <button onClick={refetch}>Refresh Profile</button>
//                         <button onClick={logout}>Logout</button>
//                     </div>
//                 </div>
//             ) : (
//                 <p>No user data available</p>
//             )}
//         </div>
//     );
// };
//
// /**
//  * ❌ BEFORE: Bad practice example (what you had before)
//  *
//  * export const UserProfileBadExample: React.FC = () => {
//  *     const { auth, isAuthenticated, login, logout } = useAuth();
//  *
//  *     // ❌ Problems:
//  *     // 1. AuthContext was doing too much (auth + profile)
//  *     // 2. No separation of concerns
//  *     // 3. Hard to handle profile-specific errors
//  *     // 4. Difficult to refresh profile independently
//  *     // 5. AuthContext was directly calling userService.getProfile()
//  *
//  *     return (
//  *         <div>
//  *             {auth ? (
//  *                 <p>Welcome, {auth.email}</p>
//  *             ) : (
//  *                 <p>Not authenticated</p>
//  *             )}
//  *         </div>
//  *     );
//  * };
//  */
