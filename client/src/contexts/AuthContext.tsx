import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import authService, { User } from "services/authService";

interface AuthContextType {
    isAuthenticated: boolean;
    user : User | null;
    isLoading : boolean;
    error : string | null;
    login : () => Promise<void>;
    logout : () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined >(undefined);

export const AuthProvider : React.FC<{children : ReactNode}> = ({children}) => {
    
    //is auth , user , loading state and error state 
    const [isAuthenticated , setIsAuthenticated] = useState<boolean>(false);
    const [user , setUser] = useState<User | null>(null);
    const [isLoading , setIsLoading] = useState<boolean>(true);
    const [error , setError] = useState<string | null>(null);

    useEffect(() =>{
        const checkAuth = async() => {
            try{
                const userData = await authService.getCurrentUser();
                if (userData){
                    //stuff w 3fayes
                    setUser(userData);
                    setIsAuthenticated(true);
                }
                
            }
            catch(error){
                setError("failed to authenticate user");
            }
            finally{
                setIsLoading(false);
            }
    };

    checkAuth();
    } , []);

    const login = async () =>{
        try{
            setIsLoading(true);
            setError(null);
            const authUrl = await authService.getAuthUrl();
            window.location.href = authUrl;
        }
        catch(error){
            setError("failed to authenticate user");
            setIsLoading(false);
        }

    }

    const logout = async () => {
        try{
            setIsLoading(true);
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);

        }
        catch(error){
            setError("failed to logout user");
            setIsLoading(false);
        }

    }


    return (
        <AuthContext.Provider
            value ={{
                isAuthenticated,
                user,
                isLoading,
                error,
                login,
                logout
            }}
            >
                {children}
            </AuthContext.Provider>
    )
};

export const useAuth = () : AuthContextType => {
    const context = useContext(AuthContext);

    if(context == undefined){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};