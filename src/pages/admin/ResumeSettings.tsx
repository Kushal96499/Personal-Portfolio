import { useState, useEffect } from 'react';
import { api, Education, Experience, ResumeData } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    GraduationCap,
    Briefcase,
    BarChart3,
    FileText,
    Upload,
    Download
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const ResumeSettings = () => {
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Education Dialog State
    const [educationDialogOpen, setEducationDialogOpen] = useState(false);
    const [editingEducation, setEditingEducation] = useState<Education | null>(null);
    const [educationForm, setEducationForm] = useState({
        degree: '',
        institute: '',
        startYear: '',
        endYear: '',
        description: ''
    });

    // Experience Dialog State
    const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
    const [experienceForm, setExperienceForm] = useState({
        role: '',
        company: '',
        startYear: '',
        endYear: '',
        isPresent: false,
        description: ''
    });

    // Stats Form State
    const [statsForm, setStatsForm] = useState({
        projectsCompleted: 0,
        yearsOfExperience: 0
    });

    useEffect(() => {
        fetchResumeData();
    }, []);

    const fetchResumeData = async () => {
        try {
            const data = await api.getResumeData();
            setResumeData(data);
            setStatsForm({
                projectsCompleted: data.stats.projectsCompleted,
                yearsOfExperience: data.stats.yearsOfExperience
            });
        } catch (error) {
            console.error('Failed to fetch resume data:', error);
            toast.error('Failed to load resume data');
        } finally {
            setLoading(false);
        }
    };

    // ==================== EDUCATION HANDLERS ====================
    const handleOpenEducationDialog = (education?: Education) => {
        if (education) {
            setEditingEducation(education);
            setEducationForm({
                degree: education.degree,
                institute: education.institute,
                startYear: education.startYear,
                endYear: education.endYear,
                description: education.description
            });
        } else {
            setEditingEducation(null);
            setEducationForm({
                degree: '',
                institute: '',
                startYear: '',
                endYear: '',
                description: ''
            });
        }
        setEducationDialogOpen(true);
    };

    const handleSaveEducation = async () => {
        if (!educationForm.degree || !educationForm.institute || !educationForm.startYear || !educationForm.endYear) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const newEducation: Education = {
                id: editingEducation?.id || crypto.randomUUID(),
                ...educationForm
            };

            const updatedEducation = editingEducation
                ? resumeData!.education.map(e => e.id === editingEducation.id ? newEducation : e)
                : [...(resumeData?.education || []), newEducation];

            await api.updateResumeData({ education: updatedEducation });
            toast.success(editingEducation ? 'Education updated' : 'Education added');
            setEducationDialogOpen(false);
            fetchResumeData();
        } catch (error: any) {
            console.error('Failed to save education:', error);
            toast.error(`Failed to save education: ${error.message || 'Unknown error'}`);
        }
    };

    const handleDeleteEducation = async (id: string) => {
        if (!confirm('Are you sure you want to delete this education entry?')) return;

        try {
            const updatedEducation = resumeData!.education.filter(e => e.id !== id);
            await api.updateResumeData({ education: updatedEducation });
            toast.success('Education deleted');
            fetchResumeData();
        } catch (error) {
            console.error('Failed to delete education:', error);
            toast.error('Failed to delete education');
        }
    };

    // ==================== EXPERIENCE HANDLERS ====================
    const handleOpenExperienceDialog = (experience?: Experience) => {
        if (experience) {
            setEditingExperience(experience);
            setExperienceForm({
                role: experience.role,
                company: experience.company,
                startYear: experience.startYear,
                endYear: experience.endYear,
                isPresent: experience.isPresent,
                description: experience.description
            });
        } else {
            setEditingExperience(null);
            setExperienceForm({
                role: '',
                company: '',
                startYear: '',
                endYear: '',
                isPresent: false,
                description: ''
            });
        }
        setExperienceDialogOpen(true);
    };

    const handleSaveExperience = async () => {
        if (!experienceForm.role || !experienceForm.company || !experienceForm.startYear) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!experienceForm.isPresent && !experienceForm.endYear) {
            toast.error('Please provide end year or mark as present');
            return;
        }

        try {
            const newExperience: Experience = {
                id: editingExperience?.id || crypto.randomUUID(),
                ...experienceForm
            };

            const updatedExperience = editingExperience
                ? resumeData!.experience.map(e => e.id === editingExperience.id ? newExperience : e)
                : [...(resumeData?.experience || []), newExperience];

            await api.updateResumeData({ experience: updatedExperience });
            toast.success(editingExperience ? 'Experience updated' : 'Experience added');
            setExperienceDialogOpen(false);
            fetchResumeData();
        } catch (error) {
            console.error('Failed to save experience:', error);
            toast.error('Failed to save experience');
        }
    };

    const handleDeleteExperience = async (id: string) => {
        if (!confirm('Are you sure you want to delete this experience entry?')) return;

        try {
            const updatedExperience = resumeData!.experience.filter(e => e.id !== id);
            await api.updateResumeData({ experience: updatedExperience });
            toast.success('Experience deleted');
            fetchResumeData();
        } catch (error) {
            console.error('Failed to delete experience:', error);
            toast.error('Failed to delete experience');
        }
    };

    // ==================== STATS HANDLERS ====================
    const handleSaveStats = async () => {
        try {
            await api.updateResumeData({
                stats: {
                    ...resumeData!.stats,
                    projectsCompleted: statsForm.projectsCompleted,
                    yearsOfExperience: statsForm.yearsOfExperience
                }
            });
            toast.success('Stats updated successfully');
            fetchResumeData();
        } catch (error) {
            console.error('Failed to save stats:', error);
            toast.error('Failed to save stats');
        }
    };

    // ==================== PDF HANDLERS ====================
    const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const publicUrl = await api.uploadResumePDF(file);
            toast.success('Resume PDF uploaded successfully');
            fetchResumeData();
        } catch (error: any) {
            console.error('Failed to upload PDF:', error);
            toast.error(error.message || 'Failed to upload PDF');
        } finally {
            setUploading(false);
        }
    };

    const handleDeletePDF = async () => {
        if (!confirm('Are you sure you want to delete the resume PDF?')) return;

        try {
            await api.deleteResumePDF();
            toast.success('Resume PDF deleted');
            fetchResumeData();
        } catch (error) {
            console.error('Failed to delete PDF:', error);
            toast.error('Failed to delete PDF');
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading resume data...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold font-orbitron text-gradient">Resume Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your education, experience, and resume PDF</p>
            </div>

            {/* Education Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="text-primary" size={24} />
                            <CardTitle>Education</CardTitle>
                        </div>
                        <Button onClick={() => handleOpenEducationDialog()} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Education
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {resumeData?.education.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No education entries yet</p>
                        ) : (
                            resumeData?.education.map((edu) => (
                                <div key={edu.id} className="glass p-4 rounded-lg group hover:border-primary/30 transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-primary">{edu.degree}</h4>
                                            <p className="text-sm text-muted-foreground">{edu.institute}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {edu.startYear} - {edu.endYear}
                                            </p>
                                            {edu.description && (
                                                <p className="text-sm mt-2 text-muted-foreground">{edu.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" onClick={() => handleOpenEducationDialog(edu)}>
                                                <Edit2 className="w-4 h-4 text-blue-400" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDeleteEducation(edu.id)}>
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Experience Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Briefcase className="text-secondary" size={24} />
                            <CardTitle>Experience</CardTitle>
                        </div>
                        <Button onClick={() => handleOpenExperienceDialog()} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Experience
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {resumeData?.experience.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No experience entries yet</p>
                        ) : (
                            resumeData?.experience.map((exp) => (
                                <div key={exp.id} className="glass p-4 rounded-lg group hover:border-secondary/30 transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-secondary">{exp.role}</h4>
                                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {exp.startYear} - {exp.isPresent ? 'Present' : exp.endYear}
                                            </p>
                                            {exp.description && (
                                                <p className="text-sm mt-2 text-muted-foreground whitespace-pre-line">{exp.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" onClick={() => handleOpenExperienceDialog(exp)}>
                                                <Edit2 className="w-4 h-4 text-blue-400" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDeleteExperience(exp.id)}>
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Stats Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-accent/10">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="text-accent" size={24} />
                        <CardTitle>Resume Stats</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass p-4 rounded-lg">
                            <Label className="text-xs text-muted-foreground">Education Count (Auto)</Label>
                            <p className="text-2xl font-bold text-primary mt-1">{resumeData?.stats.educationCount || 0}</p>
                        </div>
                        <div className="glass p-4 rounded-lg">
                            <Label className="text-xs text-muted-foreground">Experience Count (Auto)</Label>
                            <p className="text-2xl font-bold text-secondary mt-1">{resumeData?.stats.experienceCount || 0}</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Projects Completed</Label>
                            <Input
                                type="number"
                                value={statsForm.projectsCompleted}
                                onChange={(e) => setStatsForm({ ...statsForm, projectsCompleted: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Years of Experience</Label>
                            <Input
                                type="number"
                                value={statsForm.yearsOfExperience}
                                onChange={(e) => setStatsForm({ ...statsForm, yearsOfExperience: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                    <Button onClick={handleSaveStats} className="mt-4 w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Save Stats
                    </Button>
                </CardContent>
            </Card>

            {/* PDF Upload Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileText className="text-primary" size={24} />
                        <CardTitle>Resume PDF</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {resumeData?.resume_pdf_path ? (
                            <div className="glass p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-primary" size={32} />
                                        <div>
                                            <p className="font-semibold">Resume PDF Uploaded</p>
                                            <a
                                                href={resumeData.resume_pdf_path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline"
                                            >
                                                View PDF
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={handleDeletePDF}>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">No resume PDF uploaded</p>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="pdf-upload" className="cursor-pointer">
                                <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/60 transition-colors">
                                    <Upload className="w-5 h-5" />
                                    <span>{resumeData?.resume_pdf_path ? 'Replace Resume PDF' : 'Upload Resume PDF'}</span>
                                </div>
                            </Label>
                            <Input
                                id="pdf-upload"
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handlePDFUpload}
                                disabled={uploading}
                            />
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                PDF only • Max 20MB
                            </p>
                            {uploading && (
                                <p className="text-sm text-primary text-center mt-2">Uploading...</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Education Dialog */}
            <Dialog open={educationDialogOpen} onOpenChange={setEducationDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingEducation ? 'Edit Education' : 'Add Education'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Degree Title *</Label>
                            <Input
                                placeholder="e.g. Bachelor of Computer Applications"
                                value={educationForm.degree}
                                onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Institute / College *</Label>
                            <Input
                                placeholder="e.g. Biyani College"
                                value={educationForm.institute}
                                onChange={(e) => setEducationForm({ ...educationForm, institute: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Year *</Label>
                                <Input
                                    placeholder="2020"
                                    value={educationForm.startYear}
                                    onChange={(e) => setEducationForm({ ...educationForm, startYear: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Year *</Label>
                                <Input
                                    placeholder="2024"
                                    value={educationForm.endYear}
                                    onChange={(e) => setEducationForm({ ...educationForm, endYear: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description (Markdown supported)</Label>
                            <Textarea
                                placeholder="Specialized in Cybersecurity, Web Development..."
                                value={educationForm.description}
                                onChange={(e) => setEducationForm({ ...educationForm, description: e.target.value })}
                                rows={4}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEducationDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEducation}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Experience Dialog */}
            <Dialog open={experienceDialogOpen} onOpenChange={setExperienceDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingExperience ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Role *</Label>
                            <Input
                                placeholder="e.g. Software Engineer Intern"
                                value={experienceForm.role}
                                onChange={(e) => setExperienceForm({ ...experienceForm, role: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Company Name *</Label>
                            <Input
                                placeholder="e.g. CodTech"
                                value={experienceForm.company}
                                onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Year *</Label>
                                <Input
                                    placeholder="2023"
                                    value={experienceForm.startYear}
                                    onChange={(e) => setExperienceForm({ ...experienceForm, startYear: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Year</Label>
                                <Input
                                    placeholder="2024"
                                    value={experienceForm.endYear}
                                    onChange={(e) => setExperienceForm({ ...experienceForm, endYear: e.target.value })}
                                    disabled={experienceForm.isPresent}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="present"
                                checked={experienceForm.isPresent}
                                onCheckedChange={(checked) => setExperienceForm({ ...experienceForm, isPresent: checked as boolean })}
                            />
                            <Label htmlFor="present" className="cursor-pointer">Currently working here</Label>
                        </div>
                        <div className="space-y-2">
                            <Label>Description (Bullet list supported)</Label>
                            <Textarea
                                placeholder="• Developed web applications&#10;• Implemented security features&#10;• Worked on automation"
                                value={experienceForm.description}
                                onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                                rows={5}
                            />
                            <p className="text-xs text-muted-foreground">Use • or - for bullet points</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setExperienceDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveExperience}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ResumeSettings;
