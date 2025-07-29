"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Stethoscope,
  Calendar,
  Trash2,
  Upload,
  FileText,
  Download,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  license_number: string;
  created_at: string;
}

interface Appointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  appointment_datetime: string;
  status: string;
  created_at: string;
  user?: User; // Added for nested user info
  doctor?: Doctor; // Added for nested doctor info
  appointment_time?: string; // Added for appointment_time
}

interface Report {
  id: string;
  filename: string;
  uploaded_at: string;
  file_url?: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const [usersResponse, doctorsResponse, appointmentsResponse] =
        await Promise.all([
          fetch("http://abooking.geeksewa.com/api/admin/users", {
            headers,
          }).then((res) => res.json()),
          fetch("http://abooking.geeksewa.com/api/admin/doctors", {
            headers,
          }).then((res) => res.json()),
          fetch("http://abooking.geeksewa.com/api/admin/appointments", {
            headers,
          }).then((res) => res.json()),
        ]);

      if (
        usersResponse &&
        usersResponse.users &&
        Array.isArray(usersResponse.users.data)
      )
        setUsers(usersResponse.users.data);
      if (
        doctorsResponse &&
        doctorsResponse.doctors &&
        Array.isArray(doctorsResponse.doctors.data)
      )
        setDoctors(doctorsResponse.doctors.data);
      if (
        appointmentsResponse &&
        appointmentsResponse.appointments &&
        Array.isArray(appointmentsResponse.appointments.data)
      )
        setAppointments(appointmentsResponse.appointments.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadReport = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        "https://ql6cijuo0e.execute-api.us-east-1.amazonaws.com/prod",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: "Report uploaded successfully!",
        });

        // Add the new report to the list
        const newReport: Report = {
          id: result.id || Date.now().toString(),
          filename: selectedFile.name,
          uploaded_at: new Date().toISOString(),
          file_url: result.file_url || result.url,
        };
        setReports((prev) => [newReport, ...prev]);
        setSelectedFile(null);

        // Reset file input
        const fileInput = document.getElementById(
          "file-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadReport = async (report: Report) => {
    if (report.file_url) {
      try {
        const response = await fetch(report.file_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = report.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to download report.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      await fetch(`http://abooking.geeksewa.com/api/admin/users/${userId}`, {
        method: "DELETE",
        headers,
      });
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      await fetch(
        `http://abooking.geeksewa.com/api/admin/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers,
        }
      );
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
      toast({
        title: "Appointment Deleted",
        description: "The appointment has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete appointment.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage users, doctors, appointments, and reports
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {users.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Doctors
              </CardTitle>
              <Stethoscope className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {doctors.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {appointments.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reports
              </CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {reports.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Card className="border-0 shadow-lg">
          <Tabs defaultValue="users" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="doctors">Doctors</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="users" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the user account for{" "}
                                    {user.name}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No users found
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="doctors" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell className="font-medium">
                            Dr. {doctor.name}
                          </TableCell>
                          <TableCell>{doctor.email}</TableCell>
                          <TableCell>{doctor.specialization}</TableCell>
                          <TableCell>{doctor.license_number}</TableCell>
                          <TableCell>{formatDate(doctor.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {doctors.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No doctors found
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="appointments" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => {
                        const patientName =
                          appointment.user?.name || appointment.patient_name;
                        const doctorName =
                          appointment.doctor?.name || appointment.doctor_name;
                        const dateTimeString =
                          appointment.appointment_time ||
                          appointment.appointment_datetime;
                        const dateTime = dateTimeString
                          ? new Date(dateTimeString.replace(" ", "T"))
                          : null;
                        return (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">
                              {patientName}
                            </TableCell>
                            <TableCell>Dr. {doctorName}</TableCell>
                            <TableCell>
                              {dateTime && !isNaN(dateTime.getTime())
                                ? dateTime.toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(appointment.status)}
                            </TableCell>
                            <TableCell>
                              {formatDate(appointment.created_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 bg-transparent"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete the appointment between{" "}
                                      {patientName} and Dr. {doctorName}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteAppointment(appointment.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {appointments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No appointments found
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="reports" className="space-y-6">
                {/* Upload Section */}
                <Card className="border-2 border-dashed border-gray-300 p-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file-upload">Select Report File</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="text-sm text-gray-600">
                          Selected: {selectedFile.name} (
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleUploadReport}
                      disabled={!selectedFile || isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Report
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Reports List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Uploaded Reports</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Filename</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              {report.filename}
                            </TableCell>
                            <TableCell>
                              {formatDate(report.uploaded_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {report.file_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadReport(report)}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 bg-transparent"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete the report "
                                        {report.filename}".
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          setReports((prev) =>
                                            prev.filter(
                                              (r) => r.id !== report.id
                                            )
                                          );
                                          toast({
                                            title: "Report Deleted",
                                            description:
                                              "The report has been successfully deleted.",
                                          });
                                        }}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {reports.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No reports uploaded yet
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
