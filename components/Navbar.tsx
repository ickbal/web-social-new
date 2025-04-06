import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { getSiteDomain, getSiteName } from "../lib/env";
import Button from "./action/Button";
import IconShare from "./icon/IconShare";
import IconContact from "./icon/IconContact";
import React, { useState } from "react";
import Modal from "./modal/Modal";
import InputClipboardCopy from "./input/InputClipboardCopy";
import { Tooltip } from "react-tooltip";
import InputText from "./input/InputText";

const Navbar = ({ roomId }: { roomId?: string }) => {
  const [showShare, setShowShare] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setContactForm({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={"py-1 px-2 flex flex-row gap-1 items-stretch bg-dark-900"}>
      <Link
        href={"/"}
        className={
          "flex p-1 shrink-0 flex-row gap-1 items-center rounded action"
        }
      >
        <Image
          src={"/logo_white.png"}
          alt={"Ickbal Watch Party logo"}
          width={36}
          height={36}
          unoptimized
        />
        <span className={"hide-below-sm"}>{getSiteName()}</span>
      </Link>
      
      <div className="ml-auto flex items-center gap-2">
        {roomId && (
          <>
            <Modal
              title={"Invite your friends"}
              show={showShare}
              close={() => setShowShare(false)}
            >
              <div>Share this link to let more people join in on the fun</div>
              <InputClipboardCopy
                className={"bg-dark-1000"}
                value={getSiteDomain() + "/room/" + roomId}
              />
            </Modal>
            <Button
              tooltip={"Share the room link"}
              id={"navbar-share"}
              actionClasses={"hover:bg-primary-800 active:bg-primary-700"}
              className={"p-2 bg-primary-900"}
              onClick={() => setShowShare(true)}
            >
              <div className={"flex items-center mx-1"}>
                <IconShare className={"mr-1"} />
                Share
              </div>
            </Button>
          </>
        )}

        <Modal
          title={"Contact Us"}
          show={showContact}
          close={() => {
            setShowContact(false);
            setContactForm({ name: "", email: "", message: "" });
            setSubmitStatus(null);
          }}
        >
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </label>
              <InputText
                value={contactForm.name}
                onChange={(value) => setContactForm(prev => ({ ...prev, name: value }))}
                required
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <InputText
                value={contactForm.email}
                onChange={(value) => setContactForm(prev => ({ ...prev, email: value }))}
                required
                placeholder="Your email"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                Message
              </label>
              <textarea
                id="message"
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                required
                placeholder="Your message"
                className="w-full px-3 py-2 bg-dark-1000 border border-dark-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
              />
            </div>
            {submitStatus === "success" && (
              <div className="text-green-500 text-sm">
                Message sent successfully! We'll get back to you soon.
              </div>
            )}
            {submitStatus === "error" && (
              <div className="text-red-500 text-sm">
                Failed to send message. Please try again later.
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-primary-900 hover:bg-primary-800 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </Modal>
        <Button
          tooltip={"Contact Us"}
          id={"navbar-contact"}
          actionClasses={"hover:bg-primary-800 active:bg-primary-700"}
          className={"p-2 bg-primary-900"}
          onClick={() => setShowContact(true)}
        >
          <div className={"flex items-center mx-1"}>
            <IconContact className={"mr-1"} />
            Contact
          </div>
        </Button>

        {/* Authentication UI */}
        {isLoading ? (
          <div className="text-gray-400 px-2">Loading...</div>
        ) : session ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 hover:bg-dark-800 p-2 rounded">
              {session.user?.image ? (
                <Image 
                  src={session.user.image} 
                  alt={session.user.name || "User"} 
                  width={32} 
                  height={32} 
                  className="rounded-full"
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center">
                  {session.user?.name?.charAt(0) || "U"}
                </div>
              )}
              <span className="hide-below-md">{session.user.name}</span>
            </div>
            <Button
              tooltip={"Sign out"}
              id={"navbar-signout"}
              actionClasses={"hover:bg-dark-700 active:bg-dark-600"}
              className={"p-2 bg-dark-800"}
              onClick={() => signOut()}
            >
              <div className={"flex items-center mx-1"}>
                Sign out
              </div>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              tooltip={"Sign in with Google"}
              id={"navbar-signin"}
              actionClasses={"hover:bg-dark-700 active:bg-dark-600"}
              className={"p-2 bg-dark-800"}
              onClick={() => {
                console.log("Starting Google sign-in...");
                signIn("google");
              }}
            >
              <div className={"flex items-center mx-1"}>
                Sign in
              </div>
            </Button>
          </div>
        )}
      </div>
      
      <Tooltip
        anchorId={"navbar-share"}
        place={"bottom"}
        style={{
          backgroundColor: "var(--dark-700)",
        }}
      />
      <Tooltip
        anchorId={"navbar-contact"}
        place={"bottom"}
        style={{
          backgroundColor: "var(--dark-700)",
        }}
      />
      <Tooltip
        anchorId={"navbar-signin"}
        place={"bottom"}
        style={{
          backgroundColor: "var(--dark-700)",
        }}
      />
      <Tooltip
        anchorId={"navbar-signout"}
        place={"bottom"}
        style={{
          backgroundColor: "var(--dark-700)",
        }}
      />
    </div>
  );
};

export default Navbar;
