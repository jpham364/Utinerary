import { useParams } from "react-router";
import { useEffect, useState } from "react";
import supabase from "@/utils/supabase";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { House, MapPin, Plus, Clock, Share, Pencil, UserPlus } from "lucide-react";
import { useNavigate } from "react-router";

import { ScrollToTopButton } from "@/components/ui/scrollTopButton";

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

import { NewActivityForm } from "@/components/forms/newActivity-form";
import { EditActivityForm } from "@/components/forms/editActivity-form";
import { EditPlanForm } from "@/components/forms/editPlan-form";
import { AddCollaboratorsForm } from "@/components/forms/addCollaborators-form";

import { format } from "date-fns";

export default function Plan() {
  const navigate = useNavigate();

  const { token } = useParams<{ token: string }>();

  const [copySuccess, setCopySuccess] = useState(false);

  type Activity = {
    id: number;
    title: string;
    location: string;
    notes: string;
    start: string | null;
  };

  const [plan, setPlan] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const [addActivityDialogOpen, setAddActivityDialogOpen] = useState(false);
  const [editActivityDialogOpen, setEditActivityDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [editPlanDialogOpen, setEditPlanDialogOpen] = useState(false);
  const [collaboratorEmails, setCollaboratorEmails] = useState<string[]>([])

  const [addCollabOpen, setAddCollabOpen] = useState(false);

  const fetchActivities = async (planId: string) => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("plan_id", planId)
      .order("start", { ascending: true });
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
      .eq("public_token", token)
      .single();


    if (error) {
      console.error("Failed to fetch plan:", error);
    } else {
      setPlan(data);
      fetchActivities(data.id);
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
      fetchActivities(plan.id); // Refresh the list after deletion
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareURL);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  useEffect(() => {
    fetchPlan();
  }, [token]);

  const groupedByDate = activities.reduce((acc: Record<string, Activity[]>, a) => {
    const dateKey = a.start ? format(new Date(a.start), "yyyy-MM-dd") : "Undated";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(a);
    return acc;
  }, {});

  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const fetchCollaborators = async () => {
  const { data } = await supabase
    .from("plan_collaborators")
    .select("collaborator_email")
    .eq("plan_id", plan.id);

    if (data) {
      setCollaboratorEmails(data.map(c => c.collaborator_email));
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setUserId(data?.user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchCollaborators = async () => {
      const { data } = await supabase
        .from("plan_collaborators")
        .select("collaborator_email")
        .eq("plan_id", plan.id);

      if (data) {
        setCollaboratorEmails(data.map(c => c.collaborator_email));
      }
    };

    if (plan?.id) fetchCollaborators();
  }, [plan]);

  useEffect(() => {
    if (!plan?.id) return;

    // initializes a Supabase channel for real-time events:
    const channel = supabase.channel('plan-activity-updates');

    // This listens for any changes (event: '*') to the activities 
    // table where plan_id equals the current plan’s ID.
    // When a change happens (insert, update, delete), it calls: fetchActivities()
    // This applies similarly to the plans table
    channel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activities',
        filter: `plan_id=eq.${plan.id}`,
      }, () => {
        fetchActivities(plan.id);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'plans',
        filter: `public_token=eq.${token}`,
      }, () => {
        fetchPlan();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Properly unsubscribe
    };
  }, [plan?.id, token]);

  if (loading) return <p></p>;
  if (!plan) return <p>Plan not found.</p>;

  const shareURL = `${window.location.origin}/plan/${plan.public_token}`;
  const isCollaborator = user && collaboratorEmails.includes(user.email);
  const isOwner = userId && plan && userId === plan.user_id;
  const bothPerms = isOwner || isCollaborator

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header nav bar */}
        <Header />

        {/* Buttons  */}
        {bothPerms && (
          <div className="flex justify-between mt-4 mb-4">
            <Button variant="outline" onClick={() => navigate("/home")}>
              <House />
              Home
            </Button>

            {isOwner && (
                <Dialog
                  open={addCollabOpen}
                  onOpenChange={setAddCollabOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline"> <UserPlus /> Add Collaborators </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                      <DialogTitle>Add Collaborators</DialogTitle>
                      <DialogDescription>
                        Emails added will need to have an account to gain editing access.
                      </DialogDescription>
                    </DialogHeader>

                    <AddCollaboratorsForm
                      plan={plan}
                      collaboratorEmails={collaboratorEmails}
                      onUpdate={fetchCollaborators}
                    />
          
                  </DialogContent>
                </Dialog>
              )}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold mt-4">{plan.title}</h1>

        {/* Basic information */}
        <div className="bg-muted rounded-2xl p-4 mt-4 space-y-4 text-muted-foreground shadow">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-foreground">Details</h2>
            <div className="flex gap-4">
              {bothPerms && (
                <Dialog
                  open={editPlanDialogOpen}
                  onOpenChange={setEditPlanDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="default" size="sm"><Pencil /> Edit</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
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
                )}
             
              <Button onClick={copyToClipboard} size="sm">
                <Share /> 
                {copySuccess ? "Copied!" : "Share"}
              </Button>
                  
            </div>
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
            {bothPerms && (
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
                    onPlanCreated={() => fetchActivities(plan.id)}
                    onCloseDialog={() => setAddActivityDialogOpen(false)}
                    planId={plan.id!}
                    planStart={plan.start}
                    planEnd={plan.end}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="overflow-x-auto flex gap-2 pb-2 border-b mb-4">
            {Object.keys(groupedByDate)
              .sort((a, b) => {
                if (a === "Undated") return 1; // Put "Undated" at the end
                if (b === "Undated") return -1;
                return new Date(a).getTime() - new Date(b).getTime(); // Sort dates ascending
              })
              .map((date) => (
                <button
                  key={date}
                  className="px-3 py-1 text-sm rounded-lg bg-muted text-foreground hover:bg-foreground hover:text-background transition"
                  onClick={() => {
                    const el = document.getElementById(`day-${date}`);
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {date === "Undated"
                    ? "Unscheduled"
                    : format(new Date(date + "T12:00:00"), "MMM d")}
                </button>
            ))}
          </div>

          {Object.entries(groupedByDate).map(([date, dayActivities]) => (
            <div key={date} className="space-y-4">
              
              <h3 id={`day-${date}`} className="text-lg font-bold text-foreground mt-6 border-b pb-1">
                {date === "Undated"
                  ? "Unscheduled"
                  : format(new Date(date + "T12:00:00"), "PPP")}
              </h3>


              {dayActivities.map((a) => (
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

                        {bothPerms && (
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
                              onClick={() => handleActivityDelete(a.id)}
                            >
                              Delete
                            </Button>
                          
                          </div>
                        )}
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

            </div>
          ))}

          {selectedActivity && (
            <Dialog
              open={editActivityDialogOpen}
              onOpenChange={setEditActivityDialogOpen}
            >
              <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                  <DialogTitle>Edit activity</DialogTitle>
                  <DialogDescription>
                    Update your activity information below.
                  </DialogDescription>
                </DialogHeader>

                {/* Edit Activity Form */}
                <EditActivityForm
                  activity={selectedActivity}
                  onOpenChange={() => fetchActivities(plan.id)}
                  onActivityUpdated={() => setEditActivityDialogOpen(false)}
                  planStart={plan.start}
                  planEnd={plan.end}
                />
              </DialogContent>
            </Dialog>
          )}

          <ScrollToTopButton/>
          
        </div>
      </div>
    </div>
  );
}
