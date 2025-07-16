"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Check, X, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";

interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  appointment_datetime: string;
  appointment_time?: string;
  status: "pending" | "accepted" | "rejected";
  notes?: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        "http://abooking.geeksewa.com/api/doctors/appointments",
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      const data = await response.json();
      if (data && data.appointments && Array.isArray(data.appointments.data)) {
        setAppointments(data.appointments.data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAppointment = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(
        `http://abooking.geeksewa.com/api/doctors/appointments/${appointmentId}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      toast({
        title: "Appointment Accepted",
        description: "The appointment has been accepted successfully.",
      });
      fetchAppointments(); // Refetch to update UI and show time
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept appointment.",
        variant: "destructive",
      });
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(
        `http://abooking.geeksewa.com/api/doctors/appointments/${appointmentId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      toast({
        title: "Appointment Rejected",
        description: "The appointment has been rejected.",
      });
      fetchAppointments(); // Refetch to update UI and show time
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject appointment.",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    // Fix: Replace space with 'T' if needed for ISO format
    let safeString = dateTimeString;
    if (
      dateTimeString &&
      dateTimeString.includes(" ") &&
      !dateTimeString.endsWith("Z")
    ) {
      safeString = dateTimeString.replace(" ", "T");
    }
    const date = new Date(safeString);
    if (isNaN(date.getTime())) {
      return { date: "-", time: "-" };
    }
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "pending"
  );
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "accepted"
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status === "rejected"
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Doctor Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your appointments and patient consultations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Requests
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingAppointments.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {upcomingAppointments.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Appointments
              </CardTitle>
              <User className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {appointments.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Appointments */}
        {pendingAppointments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Pending Requests
            </h2>
            <div className="grid gap-4">
              {pendingAppointments.map((appointment) => {
                const { date, time } = formatDateTime(
                  appointment.appointment_time ||
                    appointment.appointment_datetime
                );
                return (
                  <Card
                    key={appointment.id}
                    className="border-0 shadow-md border-l-4 border-l-yellow-500"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {appointment.patient_name}
                          </CardTitle>
                          <CardDescription>
                            {appointment.patient_email}
                          </CardDescription>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {date}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {time}
                        </div>
                        {appointment.notes && (
                          <div className="text-sm text-gray-600">
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                        <div className="flex space-x-2 pt-2">
                          <Button
                            onClick={() =>
                              handleAcceptAppointment(appointment.id)
                            }
                            className="flex-1"
                            size="sm"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            onClick={() =>
                              handleRejectAppointment(appointment.id)
                            }
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Upcoming Appointments
            </h2>
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => {
                // Prefer appointment_time, fallback to appointment_datetime
                const { date, time } = formatDateTime(
                  appointment.appointment_time ||
                    appointment.appointment_datetime
                );
                // Prefer appointment.user for patient info, fallback to patient_name/email
                const patientName =
                  appointment.user?.name || appointment.patient_name;
                const patientEmail =
                  appointment.user?.email || appointment.patient_email;
                return (
                  <Card
                    key={appointment.id}
                    className="border-0 shadow-md border-l-4 border-l-green-500"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {patientName}
                          </CardTitle>
                          <CardDescription>{patientEmail}</CardDescription>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {date}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {time}
                        </div>
                        {appointment.notes && (
                          <div className="text-sm text-gray-600">
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Appointments */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            All Appointments
          </h2>
          {appointments.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No appointments yet
                </h3>
                <p className="text-gray-600">
                  Appointments will appear here once patients start booking with
                  you.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment) => {
                const { date, time } = formatDateTime(
                  appointment.appointment_time ||
                    appointment.appointment_datetime
                );
                const patientName =
                  appointment.user?.name || appointment.patient_name;
                const patientEmail =
                  appointment.user?.email || appointment.patient_email;
                return (
                  <Card key={appointment.id} className="border-0 shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {patientName}
                          </CardTitle>
                          <CardDescription>{patientEmail}</CardDescription>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {date}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {time}
                        </div>
                        {appointment.notes && (
                          <div className="text-sm text-gray-600">
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
