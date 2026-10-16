import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({
        jobDescription,
        selfDescription,
        resumeFile,
        roadmapDays,
        technicalQuestionCount,
        behavioralQuestionCount
    }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({
                jobDescription,
                selfDescription,
                resumeFile,
                roadmapDays,
                technicalQuestionCount,
                behavioralQuestionCount
            })
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.log(error)
            const message = error?.response?.data?.message || "Unable to analyze resume right now. Please try again."
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response.interviewReport
    }

    const getReports = async ({ silent = false } = {}) => {
        if (!silent) {
            setLoading(true)
        }
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            if (!silent) {
                setLoading(false)
            }
        }

        return response?.interviewReports || []
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    useEffect(() => {
        if (interviewId) {
            return
        }

        const syncReports = () => {
            getReports({ silent: true })
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                syncReports()
            }
        }

        window.addEventListener("focus", syncReports)
        document.addEventListener("visibilitychange", handleVisibilityChange)
        const intervalId = window.setInterval(syncReports, 15000)

        return () => {
            window.removeEventListener("focus", syncReports)
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            window.clearInterval(intervalId)
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}
