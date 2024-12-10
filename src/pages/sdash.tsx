import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, FileText, MessageSquare, LogOut, Menu, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Paper {
  id: string;
  title: string;
  content: string;
  fileUrl: string; // URL of the uploaded PDF file
}

export default function StudentDashboard() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMentor, setSelectedMentor] = useState('');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track page view
  useEffect(() => {
    // Track page view in GA4
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: window.location.pathname,
      });
    }

    // Track page view in PostHog
    if (window.posthog) {
      window.posthog.capture('page view', { path: window.location.pathname });
    }
  }, []);

  // Track scroll event
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      // Track scroll event in GA4
      if (window.gtag) {
        window.gtag('event', 'scroll', {
          event_category: 'user_engagement',
          event_label: `scroll_position_${scrollPosition}`,
          value: scrollPosition,
        });
      }

      // Track scroll event in PostHog
      if (window.posthog) {
        window.posthog.capture('scroll', {
          category: 'user_engagement',
          label: `scroll_position_${scrollPosition}`,
          value: scrollPosition,
        });
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle button click event
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Track button click in GA4
    if (window.gtag) {
      window.gtag('event', 'button_click', {
        event_category: 'button',
        event_label: 'submit_button',
      });
    }

    // Track button click in PostHog
    if (window.posthog) {
      window.posthog.capture('button click', {
        category: 'button',
        label: 'submit_button',
      });
    }

    // Your existing button click logic...
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !content || !pdfFile || !selectedMentor) {
      setError('Please fill in all fields, upload a PDF file, and enter a mentor email.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('pdfFile', pdfFile);
    formData.append('mentorEmail', selectedMentor);

    try {
      const response = await fetch('/api/papers/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload the paper.');
      }

      const newPaper: Paper = await response.json();
      setPapers([...papers, newPaper]);
      setTitle('');
      setContent('');
      setPdfFile(null);
      setSelectedMentor('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSuccess('Paper submitted successfully!');

      // Track form submission in GA4
      if (window.gtag) {
        window.gtag('event', 'form_submission', {
          event_category: 'form',
          event_label: 'submit_paper',
        });
      }

      // Track form submission in PostHog
      if (window.posthog) {
        window.posthog.capture('form submission', {
          category: 'form',
          label: 'submit_paper',
        });
      }
    } catch (error) {
      console.error('Error submitting paper:', error);
      setError('Failed to submit paper. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Failed to logout. Please try again.');
    }
  };

  const openPaper = (paper: Paper) => {
    setSelectedPaper(paper);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPaper(null);
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white w-64 min-h-screen flex flex-col ${isSidebarOpen ? 'block' : 'hidden'} md:block transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-center h-20 border-b">
          <div className="ml-4">
            <h2 className="text-xl font-semibold">John Doe</h2>
            <p className="text-gray-600">Student</p>
          </div>
        </div>
        <nav className="flex-grow">
          <ul className="p-4">
            <li className="mb-4">
              <div className="flex items-center">
                <FileText className="mr-2" />
                <span>Project Progress</span>
              </div>
              <Progress value={33} className="mt-2" />
            </li>
            <li className="mb-4">
              <Link href="/chat" className="flex items-center text-blue-600 hover:text-blue-800">
                <MessageSquare className="mr-2" />
                <span>Chat with Mentor</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full flex items-center justify-center" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b md:hidden">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <Button variant="outline" onClick={toggleSidebar}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4 md:hidden">Student Dashboard</h1>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Your Papers</h2>
                {papers.length > 0 ? (
                  <ul className="bg-white shadow rounded-lg divide-y">
                    {papers.map((paper) => (
                      <li key={paper.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{paper.title}</h3>
                            <p className="text-gray-500">{paper.content}</p>
                          </div>
                          <Button  onClick={() => openPaper(paper)}>
                            View
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No papers submitted yet.</p>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Submit New Paper</h2>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="block w-full"
                    />
                    <Input
                      type="email"
                      placeholder="Mentor's email"
                      value={selectedMentor}
                      onChange={(e) => setSelectedMentor(e.target.value)}
                    />
                    <Button type="submit" className="w-full">
                      Upload Paper
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Paper Modal */}
      {selectedPaper && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={closeModal}
        >
          <div
            className="bg-white p-8 rounded-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold">{selectedPaper.title}</h2>
            <p>{selectedPaper.content}</p>
            <a href={selectedPaper.fileUrl} target="_blank" rel="noopener noreferrer">
              <Button >Download PDF</Button>
            </a>
            <Button variant="outline" className="mt-4" onClick={closeModal}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
