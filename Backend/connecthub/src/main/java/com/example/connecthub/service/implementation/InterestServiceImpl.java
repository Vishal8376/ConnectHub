package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.request.CreateInterestRequest;
import com.example.connecthub.dto.request.UpdateInterestRequest;
import com.example.connecthub.dto.response.InterestResponse;
import com.example.connecthub.entity.Interest;
import com.example.connecthub.exception.InterestNotFoundException;
import com.example.connecthub.repository.InterestRepository;
import com.example.connecthub.service.InterestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterestServiceImpl implements InterestService {

    private final InterestRepository interestRepository;

    @Override
    public InterestResponse createInterest(CreateInterestRequest request) {

        Interest interest = Interest.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Interest savedInterest = interestRepository.save(interest);

        return mapToResponse(savedInterest);
    }

    @Override
    public List<InterestResponse> getAllInterests() {

        return interestRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public InterestResponse getInterestById(Long id) {

        Interest interest = interestRepository.findById(id)
                .orElseThrow(() ->
                        new InterestNotFoundException("Interest not found"));

        return mapToResponse(interest);
    }

    @Override
    public InterestResponse updateInterest(
            Long id,
            UpdateInterestRequest request) {

        Interest interest = interestRepository.findById(id)
                .orElseThrow(() ->
                        new InterestNotFoundException("Interest not found"));

        interest.setName(request.getName());
        interest.setDescription(request.getDescription());

        Interest updatedInterest = interestRepository.save(interest);

        return mapToResponse(updatedInterest);
    }

    @Override
    public void deleteInterest(Long id) {

        Interest interest = interestRepository.findById(id)
                .orElseThrow(() ->
                        new InterestNotFoundException("Interest not found"));

        interestRepository.delete(interest);
    }

    /**
     * Entity -> DTO
     */
    private InterestResponse mapToResponse(Interest interest) {

        return InterestResponse.builder()
                .id(interest.getId())
                .name(interest.getName())
                .description(interest.getDescription())
                .build();
    }
}