import React, { useState, useRef, useEffect } from "react";
import styles from "./teamInfo.module.css";

function TeamInfo({ selectedTeamMember }) {
    const [isVisible, setIsVisible] = useState(true);
    const [teamMemberName, setTeamMemberName] = useState("");
    const [TeamMemberDiscription, setTeamMemberDiscription] = useState("");
    let teamDataCache = null;

    useEffect(() => {
        // Load team data
        fetchTeamData("/json/teamData.json").then((data) => {
            const teamData = data?.find((item) => item.identifier === selectedTeamMember);
            if (teamData) {
                setIsVisible(true);
                setTeamMemberName(teamData.memberName);
                setTeamMemberDiscription(teamData.memberDiscription);
            } else {
                setIsVisible(false);
                setTeamMemberName("");
                setTeamMemberDiscription("");
            }
        });
    }, [selectedTeamMember]);

    async function fetchTeamData(url) {
        if (!teamDataCache) {
            try {
                const response = await fetch(url);
                if (!response.ok)
                    throw new Error(`HTTP error! Status: ${response.status}`);
                teamDataCache = await response.json();
            } catch (error) {
                console.error("Failed to fetch product data:", error);
            }
        }
        return teamDataCache;
    }

    return (
        (<> {isVisible ?
            <div className={[styles.team_info_parent].join(" ")}>
                <div className={[styles.team_info_header].join(" ")}><p>{teamMemberName}</p></div>
                <div className={[styles.team_info_body].join(" ")}>{TeamMemberDiscription}</div>
            </div> : null}
        </>)
    );
}

export default TeamInfo;
