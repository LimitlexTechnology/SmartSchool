import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const ComingSoon = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <h1 className="text-4xl font-black text-primary-teal mb-4">Coming Soon!</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                We're working hard to bring you this feature. Stay tuned for updates!
            </p>
            <Button onClick={() => navigate(-1)}>
                Go Back
            </Button>
        </div>
    );
};

export default ComingSoon;
