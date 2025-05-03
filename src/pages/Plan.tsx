import { useParams } from "react-router";
import { useEffect, useState } from "react";
import supabase from "@/utils/supabase";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MapPin, Plus, Clock } from "lucide-react";
import { useNavigate } from "react-router";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { NewActivityForm } from "@/components/newActivity-form";
import { EditActivityForm } from "@/components/editActivity-form";
import { EditPlanForm } from "@/components/editPlan-form";

import { format } from "date-fns";

export default function Plan() {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const [plan, setPlan] = useState<any>(null);

  type Activity = {
    id: number;
    title: string;
    location: string;
    notes: string;
    start: string | null;
    // add other fields as needed
  };

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const [addActivityDialogOpen, setAddActivityDialogOpen] = useState(false);
  const [editActivityDialogOpen, setEditActivityDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  const [editPlanDialogOpen, setEditPlanDialogOpen] = useState(false);

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("plan_id", id);
    if (error) {
      console.error("Error loading plans:", error);
    } else {
      setActivities(data);
    }
  };

  const fetchPlan = async () => {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Failed to fetch plan:", error);
    } else {
      setPlan(data);
    }
    setLoading(false);
  };

  const handleActivityDelete = async (activityId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this activity?"
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", activityId);

    if (error) {
      console.error("Error deleting activity:", error);
    } else {
      console.log("Activity deleted successfully!");
      fetchActivities(); // Refresh the list after deletion
    }
  };

  useEffect(() => {
    fetchPlan();
    fetchActivities();
  }, [id]);

  if (loading) return <p></p>;
  if (!plan) return <p>Plan not found.</p>;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header nav bar */}
        <Header />

        {/* Buttons  */}
        <div className="flex justify-start mt-4 mb-4">
          <Button variant="outline" onClick={() => navigate("/home")}>
            <ChevronLeft />
            Back
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mt-4">{plan.title}</h1>

        {/* Basic information */}
        <div className="bg-muted rounded-2xl p-4 mt-4 space-y-4 text-muted-foreground shadow">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-foreground">Details</h2>
            <Dialog
              open={editPlanDialogOpen}
              onOpenChange={setEditPlanDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="default"> Edit</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Plan Details</DialogTitle>
                  <DialogDescription>
                    Update your plan information below.
                  </DialogDescription>
                </DialogHeader>

                {/* Edit Plan Form */}
                <EditPlanForm
                  plan={plan}
                  onOpenChange={setEditPlanDialogOpen}
                  onPlanUpdated={fetchPlan}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {/* Start Date */}
            <div className="space-y-1">
              <p className="text-foreground font-medium">Start Date</p>
              <p>
                {plan.start ? format(new Date(plan.start), "PPP") : "Error"}
              </p>
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <p className="text-foreground font-medium">End Date</p>
              <p>
                {plan.end ? format(new Date(plan.end), "PPP") : "No date set"}
              </p>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <p className="text-foreground font-medium">Location</p>
              <p>{plan.location || "No location set"}</p>
            </div>
          </div>
        </div>

        {/* Activities Section */}
        <div className="mt-10 space-y-4">
          {/* Activities Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">
              Activities
            </h2>
            <Dialog
              open={addActivityDialogOpen}
              onOpenChange={setAddActivityDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  {" "}
                  <Plus size={20} strokeWidth={2.25} /> Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add an activity</DialogTitle>
                  <DialogDescription>
                    Set up details for your activity.
                  </DialogDescription>
                </DialogHeader>

                {/* New Plan Form */}
                <NewActivityForm
                  onPlanCreated={fetchActivities}
                  onCloseDialog={() => setAddActivityDialogOpen(false)}
                  planId={id!}
                  planStart={plan.start}
                  planEnd={plan.end}
                />
              </DialogContent>
            </Dialog>
          </div>

          {activities.map((a) => (
            <Accordion
              key={a.id}
              type="single"
              collapsible
              className="w-full border rounded-lg p-3 space-y-1 hover:shadow-lg transition-shadow duration-200"
            >
              <AccordionItem value={`item-${a.id}`}>
                <AccordionTrigger className="font-semibold text-md p-0">
                  <div className="flex flex-col">
                    <h3 className="hover:underline ">{a.title}</h3>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 ">
                      <p className="text-muted-foreground text-sm flex flex-row gap-2">
                        {" "}
                        <MapPin size={20} strokeWidth={1.5} /> {a.location}
                      </p>
                      {a.start && (
                        <p className="text-muted-foreground text-sm flex flex-row gap-2 items-center">
                          <Clock size={20} strokeWidth={1.5} />{" "}
                          {format(new Date(a.start), "hh:mm a")}
                        </p>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="py-2">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="space-y-1">
                      {plan.location ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps/search/${encodeURIComponent(
                                `${a.location} ${plan.location}`
                              )}`,
                              "_blank"
                            )
                          }
                        >
                          View Location
                        </Button>
                      ) : (
                        <p>No location set</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedActivity(a);
                          setEditActivityDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleActivityDelete(a.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {a.notes && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-foreground">Notes</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {a.notes}
                        </p>
                      </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}

          {selectedActivity && (
            <Dialog
              open={editActivityDialogOpen}
              onOpenChange={setEditActivityDialogOpen}
            >
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit activity</DialogTitle>
                  <DialogDescription>
                    Update your activity information below.
                  </DialogDescription>
                </DialogHeader>

                {/* Edit Activity Form */}
                <EditActivityForm
                  activity={selectedActivity}
                  onOpenChange={fetchActivities}
                  onActivityUpdated={() => setEditActivityDialogOpen(false)}
                  planStart={plan.start}
                  planEnd={plan.end}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
