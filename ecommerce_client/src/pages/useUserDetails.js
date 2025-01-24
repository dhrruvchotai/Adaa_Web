import { useState, useEffect } from "react";
import { useUser } from "./authorization/UserContext";

const useUserDetails = () => {
    const { user } = useUser();
    const [userData, setUserData] = useState(null);
    const [isUserDataReady, setIsUserDataReady] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                const localUserData = JSON.parse(localStorage.getItem("user"));
                if (localUserData) {
                    setUserData(localUserData);
                }
            } else {
                setUserData(user);
            }
            setIsUserDataReady(true);
        };

        fetchUserData();
    }, [user]);

    return { userData, isUserDataReady };
};

export default useUserDetails;