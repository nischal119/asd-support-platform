"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, User, Stethoscope, Plus, Search } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  email: string;
  available: boolean;
  appointmentBooked?: boolean; // Added for tracking booked appointments
}

export default function UserDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingData, setBookingData] = useState({
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const filtered = doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDoctors(filtered);
  }, [doctors, searchTerm]);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        "http://abooking.geeksewa.com/api/users/doctors",
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        const doctorsWithDefaults = data.data.map((doctor: any) => ({
          ...doctor,
          specialization: doctor.specialization || "N/A",
          available:
            typeof doctor.available === "boolean" ? doctor.available : true,
        }));
        setDoctors(doctorsWithDefaults);
        setFilteredDoctors(doctorsWithDefaults);
      } else {
        setDoctors([]);
        setFilteredDoctors([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load doctors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingData((prev) => ({ ...prev, doctor_id: doctor.id }));
    setIsBookingOpen(true);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData.appointment_date || !bookingData.appointment_time) {
      toast({
        title: "Error",
        description: "Please select both date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        "http://abooking.geeksewa.com/api/users/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            doctor_id: bookingData.doctor_id,
            appointment_time: `${bookingData.appointment_date} ${bookingData.appointment_time}`,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Appointment Booked!",
          description: `Your appointment with Dr. ${selectedDoctor?.name} has been scheduled.`,
        });
        // Mark the doctor as having an appointment booked
        if (selectedDoctor) {
          setDoctors((prev) =>
            prev.map((doc) =>
              doc.id === selectedDoctor.id
                ? { ...doc, appointmentBooked: true }
                : doc
            )
          );
          setFilteredDoctors((prev) =>
            prev.map((doc) =>
              doc.id === selectedDoctor.id
                ? { ...doc, appointmentBooked: true }
                : doc
            )
          );
        }
        setIsBookingOpen(false);
        setBookingData({
          doctor_id: "",
          appointment_date: "",
          appointment_time: "",
          notes: "",
        });
        setSelectedDoctor(null);
      } else {
        throw new Error(data.message || "Failed to book appointment.");
      }
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description:
          error.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
            Find Your Doctor
          </h1>
          <p className="text-gray-600">
            Connect with specialized healthcare professionals for ASD support
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search doctors by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="hover:shadow-lg transition-shadow border-0 shadow-md"
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Dr. {doctor.name}</CardTitle>
                    <CardDescription>{doctor.specialization}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {doctor.email}
                  </div>
                  <div className="flex items-center text-sm">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        doctor.available ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {doctor.available ? "Available" : "Busy"}
                  </div>
                  <Button
                    onClick={() => handleBookAppointment(doctor)}
                    className="w-full"
                    disabled={!doctor.available || doctor.appointmentBooked}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {doctor.appointmentBooked
                      ? "Appointment Booked"
                      : "Book Appointment"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDoctors.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No doctors found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search terms."
                : "No doctors are currently available."}
            </p>
          </div>
        )}

        {/* Booking Dialog */}
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Book Appointment</DialogTitle>
              <DialogDescription>
                Schedule an appointment with Dr. {selectedDoctor?.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appointment-date">Appointment Date</Label>
                <Input
                  id="appointment-date"
                  type="date"
                  min={getTomorrowDate()}
                  value={bookingData.appointment_date}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      appointment_date: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment-time">Appointment Time</Label>
                <Select
                  value={bookingData.appointment_time}
                  onValueChange={(value) =>
                    setBookingData((prev) => ({
                      ...prev,
                      appointment_time: value,
                    }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeSlots().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="Any specific concerns or requests..."
                  value={bookingData.notes}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBookingOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
