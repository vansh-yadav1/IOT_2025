import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { AppointmentType, AppointmentCreate } from '../../types/appointment';

interface AppointmentBookingProps {
  doctorId: string;
  onSuccess?: () => void;
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  doctorId,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<AppointmentCreate>>({
    doctorId: doctorId,
    patientId: user?.id || '',
    type: AppointmentType.IN_PERSON,
    reason: '',
    notes: ''
  });

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const slots = await appointmentService.getAvailableSlots({
          doctor_id: doctorId,
          date: format(date, 'yyyy-MM-dd'),
          duration: 30 // Default duration
        });
        setAvailableSlots(slots);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch available slots',
          variant: 'destructive',
        });
      }
    };

    if (date) {
      fetchSlots();
    }
  }, [date, doctorId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast({
        title: 'Error',
        description: 'Please select a time slot',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Calculate end time (30 min after start)
      const startTime = new Date(selectedSlot);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);

      await appointmentService.create({
        ...formData,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      } as AppointmentCreate);

      toast({
        title: 'Success',
        description: 'Appointment booked successfully',
        variant: 'success',
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to book appointment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Book Appointment</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date: Date) => date && setDate(date)}
            className="rounded-md border"
            disabled={(date: Date) => date < new Date()}
          />

          {availableSlots.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Available Time Slots</h3>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedSlot === slot ? 'default' : 'outline'}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {format(new Date(slot), 'h:mm a')}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-center text-gray-500">
              No available slots for this date
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Appointment Type
            </label>
            <Select
              value={formData.type as string}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({
                ...formData,
                type: e.target.value as AppointmentType
              })}
              required
            >
              <option value={AppointmentType.IN_PERSON}>In Person</option>
              <option value={AppointmentType.VIRTUAL}>Virtual</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Reason for Visit
            </label>
            <Input
              value={formData.reason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                ...formData,
                reason: e.target.value
              })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Additional Notes
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({
                ...formData,
                notes: e.target.value
              })}
              rows={4}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !selectedSlot}
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </Button>
        </form>
      </div>
    </div>
  );
}; 