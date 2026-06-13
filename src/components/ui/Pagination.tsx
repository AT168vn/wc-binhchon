'use client';

import React, { useState } from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPreviousPage: () => void;
    onNextPage: () => void;
    onFirstPage: () => void;
    onLastPage: () => void;
    totalRecords: number;
    pageSize: number;
    onPageSizeChange: (pageSize: number) => void;
    onRefresh: () => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    onPreviousPage,
    onNextPage,
    onFirstPage,
    onLastPage,
    totalRecords,
    pageSize,
    onPageSizeChange,
    onRefresh
}: PaginationProps) {
    // State cho input nhập trang
    const [pageInput, setPageInput] = useState('');
    const [showPageInput, setShowPageInput] = useState(false);

    // Xử lý nhập trang
    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Chỉ cho phép nhập số
        if (/^\d*$/.test(value)) {
            setPageInput(value);
        }
    };

    // Xử lý submit trang
    const handlePageInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pageNumber = parseInt(pageInput);
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            onPageChange(pageNumber);
            setPageInput('');
            setShowPageInput(false);
        }
    };

    // Độ rộng cố định cho input - đủ cho 6 ký tự
    const INPUT_WIDTH = '4rem'; // Cố định 4rem cho desktop
    const MOBILE_INPUT_WIDTH = '3.5rem'; // Cố định 3.5rem cho mobile

    // Xử lý Enter key
    const handlePageInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handlePageInputSubmit(e);
        } else if (e.key === 'Escape') {
            setPageInput('');
            setShowPageInput(false);
        }
    };

    // Tạo danh sách số trang để hiển thị
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5; // Số trang tối đa hiển thị

        if (totalPages <= maxVisiblePages) {
            // Nếu tổng số trang <= 5, hiển thị tất cả
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logic hiển thị trang thông minh
            if (currentPage <= 3) {
                // Trang hiện tại ở đầu
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Trang hiện tại ở cuối
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Trang hiện tại ở giữa
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div
            className="fixed right-0 z-20 bg-white border-t border-gray-200 shadow-lg"
            style={{
                left: 'var(--sidebar-width, 0)',
                right: 'var(--content-padding-right, 0.5rem)',
                bottom: 'var(--bottom-nav-height, 0px)',
            }}
        >
            <div className="flex justify-between items-center bg-gray-50 px-4 py-1.5 rounded-lg border mx-4 my-0.5">
            {/* Phần bên trái - Refresh và Page Size */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onRefresh}
                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                    title="Làm mới dữ liệu"
                >
                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>

                {/* Desktop: Hiển thị đầy đủ text */}
                <div className="hidden sm:flex items-center gap-1.5">
                    <span className="text-sm text-gray-600">Hiển thị:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <span className="text-sm text-gray-600">bản ghi</span>
                </div>

                {/* Mobile: Chỉ hiển thị select */}
                <div className="sm:hidden">
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        title="Số bản ghi mỗi trang"
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            </div>

            {/* Phần giữa - Pagination Controls */}
            <div className="flex items-center gap-0.5">
                {/* Desktop: Hiển thị đầy đủ nút */}
                <div className="hidden sm:flex items-center gap-0.5">
                    {/* Nút Trang Đầu */}
                    <button
                        onClick={onFirstPage}
                        disabled={currentPage <= 1}
                        className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                            currentPage <= 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-200 hover:text-blue-600'
                        }`}
                        title="Trang đầu"
                    >
                        ⏮
                    </button>

                    {/* Nút Trước */}
                    <button
                        onClick={onPreviousPage}
                        disabled={currentPage <= 1}
                        className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                            currentPage <= 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-200 hover:text-blue-600'
                        }`}
                        title="Trang trước"
                    >
                        ‹
                    </button>

                    {/* Các số trang */}
                    <div className="flex items-center gap-0.5">
                        {pageNumbers.map((page, index) => (
                            <React.Fragment key={index}>
                                {page === '...' ? (
                                    <span className="px-1.5 py-1 text-sm text-gray-500">...</span>
                                ) : (
                                    <button
                                        onClick={() => onPageChange(page as number)}
                                        className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                                            currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-200 hover:text-blue-600'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Nút Tiếp */}
                    <button
                        onClick={onNextPage}
                        disabled={currentPage >= totalPages}
                        className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                            currentPage >= totalPages
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-200 hover:text-blue-600'
                        }`}
                        title="Trang tiếp"
                    >
                        ›
                    </button>

                    {/* Nút Trang Cuối */}
                    <button
                        onClick={onLastPage}
                        disabled={currentPage >= totalPages}
                        className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                            currentPage >= totalPages
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-200 hover:text-blue-600'
                        }`}
                        title="Trang cuối"
                    >
                        ⏭
                    </button>

                    {/* Input nhập trang trực tiếp */}
                    <div className="flex items-center gap-1 ml-2">
                        <span className="text-sm text-gray-600">Đến:</span>
                        {showPageInput ? (
                            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={pageInput}
                                    onChange={handlePageInputChange}
                                    onKeyDown={handlePageInputKeyPress}
                                    onBlur={() => {
                                        setPageInput('');
                                        setShowPageInput(false);
                                    }}
                                    className="px-2 py-1 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    style={{ width: INPUT_WIDTH }}
                                    placeholder="Trang"
                                    autoFocus
                                    maxLength={6}
                                />
                            </form>
                        ) : (
                            <button
                                onClick={() => setShowPageInput(true)}
                                className="px-2 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 hover:text-blue-600 transition-colors"
                                style={{ width: INPUT_WIDTH }}
                                title="Nhập số trang"
                            >
                                {currentPage}
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile: Chỉ hiển thị nút cơ bản */}
                <div className="sm:hidden flex items-center gap-0.5">
                    {/* Nút Trước */}
                    <button
                        onClick={onPreviousPage}
                        disabled={currentPage <= 1}
                        className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                            currentPage <= 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-200 hover:text-blue-600'
                        }`}
                        title="Trang trước"
                    >
                        ‹
                    </button>

                    {/* Chỉ hiển thị trang hiện tại */}
                    <span className="px-2 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded">
                        {currentPage}
                    </span>

                    {/* Nút Tiếp */}
                    <button
                        onClick={onNextPage}
                        disabled={currentPage >= totalPages}
                        className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                            currentPage >= totalPages
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-200 hover:text-blue-600'
                        }`}
                        title="Trang tiếp"
                    >
                        ›
                    </button>

                    {/* Input nhập trang cho mobile */}
                    <div className="flex items-center gap-1 ml-1">
                        {showPageInput ? (
                            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={pageInput}
                                    onChange={handlePageInputChange}
                                    onKeyDown={handlePageInputKeyPress}
                                    onBlur={() => {
                                        setPageInput('');
                                        setShowPageInput(false);
                                    }}
                                    className="px-2 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    style={{ width: MOBILE_INPUT_WIDTH }}
                                    placeholder="Trang"
                                    autoFocus
                                    maxLength={6}
                                />
                                <button
                                    type="submit"
                                    className="px-1 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    OK
                                </button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setShowPageInput(true)}
                                className="px-1 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100 hover:text-blue-600 transition-colors"
                                style={{ width: MOBILE_INPUT_WIDTH }}
                                title="Nhập số trang"
                            >
                                {currentPage}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Phần bên phải - Thông tin */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
                {/* Desktop: Hiển thị đầy đủ thông tin */}
                <div className="hidden md:flex items-center gap-3">
                    <span>
                        Tổng <span className="font-semibold text-gray-800">{totalRecords.toLocaleString()}</span> bản ghi
                    </span>
                    <span>
                        Trang <span className="font-semibold text-gray-800">{currentPage}</span>/<span className="font-semibold text-gray-800">{totalPages || 1}</span>
                    </span>
                </div>

                {/* Tablet: Chỉ hiển thị thông tin trang */}
                <div className="hidden sm:flex md:hidden items-center">
                    <span>
                        <span className="font-semibold text-gray-800">{currentPage}</span>/<span className="font-semibold text-gray-800">{totalPages || 1}</span>
                    </span>
                </div>

                {/* Mobile: Chỉ hiển thị số trang */}
                <div className="sm:hidden">
                    <span className="font-semibold text-gray-800">{currentPage}/{totalPages || 1}</span>
                </div>
            </div>
            </div>
        </div>
    );
}
