import { useState } from 'react';
import { Button } from '../components/ui/button';
import Textarea from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Users, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Update the Paper interface
interface Paper {
  id: string;
  title: string;
  fileName: string;
  uploadDate: string;
  studentName: string;
}

export default function MentorDashboard() {
  const mentorName = "Dr. John Smith"; // Replace with a dynamic value if needed
  const [assignedPapers, setAssignedPapers] = useState<Paper[]>([
    {
      id: "1",
      title: "Quantum Computing Fundamentals",
      fileName: "quantum-computing.pdf",
      uploadDate: new Date().toISOString(),
      studentName: "Alice Johnson",
    },
    {
      id: "2",
      title: "Machine Learning Basics",
      fileName: "ml-basics.pdf",
      uploadDate: new Date().toISOString(),
      studentName: "Bob Brown",
    },
    {
      id: "3",
      title: "Blockchain for Beginners",
      fileName: "blockchain.pdf",
      uploadDate: new Date().toISOString(),
      studentName: "Charlie Green",
    },
  ]);

  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handlePaperSelect = (paper: Paper) => {
    setSelectedPaper(paper);
    setComment('');
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaper) return;

    setLoading(true);
    try {
      console.log("Comment submitted:", comment);
      setComment('');

      // Track comment submission in GA4
      if (window.gtag) {
        window.gtag('event', 'comment_submitted', {
          event_category: 'Mentor Dashboard',
          event_label: selectedPaper.title,  // Track the paper title
          paper_id: selectedPaper.id,        // Track the paper ID
          mentor_name: mentorName,           // Track the mentor name (optional)
          comment_length: comment.length,    // Track the length of the comment
        });
      }

      // Track comment submission in PostHog
      if (window.posthog) {
        window.posthog.capture('comment_submitted', {
          paper_title: selectedPaper.title,   // Track the paper title
          paper_id: selectedPaper.id,         // Track the paper ID
          mentor_name: mentorName,            // Track the mentor name (optional)
          comment_length: comment.length,     // Track the length of the comment
        });
      }

    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    // Mock logout logic
    console.log("Logging out...");
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white w-64 min-h-screen flex flex-col ${isSidebarOpen ? 'block' : 'hidden'} md:block transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-center h-20 border-b">
          <div className="ml-4">
            <h2 className="text-xl font-semibold">{mentorName}</h2>
            <p className="text-gray-600">Mentor</p>
          </div>
        </div>
        <nav className="flex-grow">
          <ul className="p-4">
            <li className="mb-4">
              <div className="flex items-center">
                <Users className="mr-2" />
                <span>Students Handled: {assignedPapers.length}</span>
              </div>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b md:hidden">
          <h1 className="text-2xl font-bold">Mentor Dashboard</h1>
          <Button variant="primary" onClick={toggleSidebar}>
            <Menu />
          </Button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4 md:hidden">Mentor Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Assigned Papers</h2>
                <ul className="bg-white shadow rounded-lg divide-y">
                  {assignedPapers.map((paper) => (
                    <li
                      key={paper.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedPaper?.id === paper.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handlePaperSelect(paper)}
                    >
                      <h3 className="font-medium">{paper.title}</h3>
                      <p className="text-sm text-gray-600">By: {paper.studentName}</p>
                      <p className="text-sm text-gray-600">
                        Uploaded: {new Date(paper.uploadDate).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Paper Details</h2>
                {selectedPaper ? (
                  <div className="bg-white shadow rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">{selectedPaper.title}</h3>
                    <p className="mb-2"><strong>Student:</strong> {selectedPaper.studentName}</p>
                    <p className="mb-2"><strong>Uploaded:</strong> {new Date(selectedPaper.uploadDate).toLocaleString()}</p>
                    <p className="mb-2"><strong>File:</strong> {selectedPaper.fileName}</p>
                    <Button className="mb-4">
                      <a href={`/api/download/${selectedPaper.id}`} download>Download Paper</a>
                    </Button>
                    <form onSubmit={handleSubmitComment}>
                      <Textarea
                        placeholder="Add a comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mb-4"
                        rows={4}
                        required
                      />
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Comment'}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <p className="bg-white shadow rounded-lg p-4">Select a paper to view details and add comments.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
