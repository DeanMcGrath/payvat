"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LiveChat from "./components/live-chat"

export default function VATReturnPeriod() {
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedPeriod, setSelectedPeriod] = useState("jan-feb")

  const getPeriodLabel = (period: string) => {
    const periods = {
      "jan-feb": "January - February",
      "mar-apr": "March - April", 
      "may-jun": "May - June",
      "jul-aug": "July - August",
      "sep-oct": "September - October",
      "nov-dec": "November - December"
    }
    return periods[period as keyof typeof periods] || period
  }

  const getDueDate = (year: string, period: string) => {
    // VAT returns are due 15th of the month following the end of each taxable period
    const dueDates = {
      "jan-feb": `15 Mar ${year}`,
      "mar-apr": `15 May ${year}`,
      "may-jun": `15 Jul ${year}`,
      "jul-aug": `15 Sep ${year}`,
      "sep-oct": `15 Nov ${year}`,
      "nov-dec": `15 Jan ${parseInt(year) + 1}`
    }
    return dueDates[period as keyof typeof dueDates] || "TBD"
  }

  const isPastPeriod = (year: string, period: string) => {
    const currentYear = 2025
    const currentPeriod = "jan-feb" // Assuming we're in Jan-Feb 2025
    
    if (parseInt(year) < currentYear) return true
    if (parseInt(year) === currentYear) {
      const periodOrder = ["jan-feb", "mar-apr", "may-jun", "jul-aug", "sep-oct", "nov-dec"]
      return periodOrder.indexOf(period) < periodOrder.indexOf(currentPeriod)
    }
    return false
  }

  const getStatusMessage = () => {
    if (isPastPeriod(selectedYear, selectedPeriod)) {
      return {
        type: "past",
        message: "This is a past period. You can view or amend your previous submission.",
        color: "text-blue-800",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      }
    } else {
      return {
        type: "current",
        message: "This covers the two-month taxable period as per VAT regulations",
        color: "text-emerald-800",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200"
      }
    }
  }

  const status = getStatusMessage()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">
              PAY <span className="text-emerald-500">VAT</span>
            </h1>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold text-gray-800">Brian Cusack Trading Ltd</h3>
            <p className="text-emerald-600 font-mono text-sm">VAT: IE0352440A</p>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <Calendar className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">VAT Return Period</h2>
          <p className="text-gray-600">Select the bi-monthly period for your VAT return</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Select Return Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Tax Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Tax Period (Bi-Monthly)</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jan-feb">January - February</SelectItem>
                    <SelectItem value="mar-apr">March - April</SelectItem>
                    <SelectItem value="may-jun">May - June</SelectItem>
                    <SelectItem value="jul-aug">July - August</SelectItem>
                    <SelectItem value="sep-oct">September - October</SelectItem>
                    <SelectItem value="nov-dec">November - December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className={`${status.bgColor} border ${status.borderColor} rounded-lg p-4`}>
              <p className={`text-sm ${status.color}`}>
                <strong>Selected Period:</strong> {getPeriodLabel(selectedPeriod)} {selectedYear}
              </p>
              <p className={`text-xs ${status.color.replace('800', '600')} mt-1`}>
                {status.message}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {isPastPeriod(selectedYear, selectedPeriod) ? "Submission Was Due" : "Submission Due Date"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {isPastPeriod(selectedYear, selectedPeriod) ? "Past submission deadline" : "Submit your return by this date"}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${isPastPeriod(selectedYear, selectedPeriod) ? 'text-gray-600' : 'text-red-600'}`}>
                    {getDueDate(selectedYear, selectedPeriod)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button 
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 text-lg"
            onClick={() => window.location.href = '/vat-submission'}
          >
            {isPastPeriod(selectedYear, selectedPeriod) ? "View Past Submission" : "Continue to VAT Submission"}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? <a href="#" className="text-emerald-600 hover:text-emerald-700">View VAT submission guide</a>
          </p>
        </div>
      </div>

      {/* Live Chat */}
      <LiveChat />

      {/* Footer */}
      <footer className="mt-8 py-6 text-center border-t border-gray-200">
        <p className="text-gray-500 text-sm">payvat.ie</p>
      </footer>
    </div>
  )
}
